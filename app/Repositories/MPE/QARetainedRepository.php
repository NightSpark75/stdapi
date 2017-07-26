<?php
/**
 * QA留樣資料處理
 *
 * @version 1.0.0
 * @author spark Lin.yupin@standart.com.tw
 * @date 17/07/26
 * @since 1.0.0 spark: 建立檔案寫入與讀取相關的資料處理
 * 
 */
namespace App\Repositories\MPE;

use DB;
use Exception;

/**
 * Class QARetainedRepository
 *
 * @package App\Repositories
 */
class QARetainedRepository
{   
    public function __construct() {

    }

    public function getList($ldate = "to_number(to_char(sysdate, 'YYYYMMDD')") {
        try {
            $list = DB::select("
                select *
                from v_mpe_erp_mate vm
                where iratdt = :ldate
                    and IRSQ03 > 0
                    and not exists (select * from mpe_house_m m where m.batch = vm.irlotn) 
            ", ['ldate' => $ldate]);
            $result = [
                'result' => true,
                'msg' => '取得留樣品清單成功!(#0001)',
                'list' => $list,
            ];
            return $result;
        } catch (Exception $e) {
            $result = [
                'result' => false,
                'msg' => $e->getMessage(),
            ];
            return $result;
        }
        
    }
}   