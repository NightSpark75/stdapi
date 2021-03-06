<?php
/**
 * QC領料資料處理
 *
 * @version 1.0.0
 * @author spark Lin.yupin@standart.com.tw
 * @date 17/07/28
 * @since 1.0.0 spark: 建立檔案寫入與讀取相關的資料處理
 * 
 */
namespace App\Repositories\MPE\QC;

use DB;
use Exception;
use Auth;
use App\Traits\Sqlexecute;

/**
 * Class ReceiveRepository
 *
 * @package App\Repositories\MPE\QC
 */
class ReceiveRepository
{   
    use Sqlexecute;
    
    public function __construct() {

    }

    public function init()
    {
        try {
            $barcode = $this->getBarcode();
            $result = [
                'result' => true,
                'msg' => '取得條碼清單資料成功!(#0001)',
                'barcode' => $barcode,
            ];
            return $result;
        } catch (Exception $e) {
            return $this->exception($e);
        }
        
    }

    private function getBarcode()
    {
        $barcode = DB::select("
            select barcode, partno, pk_mpe.fu_pname(partno) pname, pk_mpe.fu_ename(partno) ename, batch, opvl, 
                    opdate, valid, buydate, pk_mpe.fu_partno_predate(partno) predate, 
                    whouse, stor, grid, amt, pk_mpe.fu_get_qc_unit(partno) unit,
                    pk_mpe.fu_get_count_qty(code, partno) qty, pk_mpe.fu_get_mate_sfty(partno) sfty
                from mpe_house_e
                where sta = 'N' and code = '01'
        ");
        return $barcode;
    }

    public function posting($receive_list) 
    {
        $barcodeList = [];
        try{
            DB::transaction( function () use($receive_list) {
                $user = auth()->user()->id;
                $today = date('Ymd');

                $rec_no = DB::selectOne("select pk_mpe.fu_create_no('PI') rec_no from dual")->rec_no;
                $dept_no = DB::selectOne("select deptno from stdadm.v_hra_emp_dept1 where empno = '$user'")->deptno;
                
                DB::insert("
                    insert into mpe_rec_m
                        (code, sinnum, typ, ouser, odept, odate, post, duser, ddate, ldate)
                    values 
                        ('01', '$rec_no', 'A', '$user', '$dept_no', to_number(to_char(sysdate, 'YYYYMMDD'))
                            ,'Y', '$user', sysdate, to_number(to_char(sysdate, 'YYYYMMDD')))
                ");

                for ($i = 0; $i < count($receive_list); $i++) {
                    $item = $receive_list[$i];
                    $rmk = "領用單號：$rec_no";
                    $binds = [
                        'code' => '01',
                        'sinnum' => $rec_no,
                        'barcode' => $item->barcode,
                        'partno' => $item->partno,
                        'whouse' => $item->whouse,
                        'stor' => $item->stor,
                        'grid' => $item->grid,
                        'batch' => $item->batch,
                        'rmk' => $rmk,
                        'duser' => $user,
                        'amt' => $item->amt,
                        'unit' => $item->unit,
                    ];

                    DB::insert("
                        insert into mpe_rec_d
                            (code, sinnum, barcode, partno, whouse, stor, grid, batch, rmk, duser, ddate, usize, unit)
                        values
                            (:code, :sinnum, :barcode, :partno, :whouse, :stor, :grid, :batch, :rmk, :duser, sysdate, :amt, :unit)
                    ", $binds);

                    $barcode = $item->barcode;
                    $opvl = DB::selectOne("select pk_mpe.fu_qc_get_valid($barcode, to_number(to_char(sysdate, 'YYYYMMDD'))) opvl from dual")->opvl;

                    DB::update("
                        update mpe_house_e e
                        set sta = 'Y'
                            , opdate = case when opdate is null then to_number(to_char(sysdate, 'YYYYMMDD')) else opdate end
                            , opvl = :opvl
                            , rmk = :rmk
                        where e.barcode = :barcode
                    ", ['barcode' => $barcode, 'opvl' => $opvl, 'rmk' => $rmk]);

                    DB::update("
                        update mpe_mate m
                        set lrdate = to_number(to_char(sysdate, 'YYYYMMDD'))
                        where exists (
                            select *
                            from mpe_rec_d d
                            where d.sinnum = :sinnum and m.partno = d.partno
                        )
                    ", ['sinnum' => $rec_no]);
                }
            });
            DB::commit();
            for ($i = 0; $i < count($receive_list); $i++) {
                $item = $receive_list[$i];
                array_push($barcodeList, '\''.$item->barcode.'\'');
            }
            $where = implode(",",$barcodeList);
            $list = DB::select("
                select e.*, pk_mpe.fu_get_count_qty(code, partno) qty, pk_mpe.fu_get_mate_sfty(partno) sfty 
                    from mpe_house_e e
                    where barcode in ($where)
            ");
            $result = [
                'result' => true,
                'msg' => '領用過帳成功!(#0002)',
                'list' => $list,
            ];
            return $result;
        } catch (Exception $e) {
            DB::rollback(); 
            $result = [
                'result' => false,
                'msg' => $e->getMessage(),
            ];
            return $result;
        }
    }
}   