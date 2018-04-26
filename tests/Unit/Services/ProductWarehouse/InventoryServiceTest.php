<?php
/**
 * InventoryService unit test
 *
 * @version 1.0.0
 * @author spark Lin.yupin@standart.com.tw
 * @date 18/04/24
 * @since 1.0.0 spark: complete
 * 
 */
namespace Tests\Unit\Services\ProductWarehouse;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use DB;
use Exception;
use App\Repositories\ProductWarehouse\InventoryRepository;
use App\Services\ProductWarehouse\InventoryService;

/**
 * Class InventoryServiceTest
 *
 * @package Tests\Unit\Services\ProductWarehouse
 */
class InventoryServiceTest extends TestCase
{
    use DatabaseTransactions;
    use WithoutMiddleware;
    
    /**
     * @var InventoryRepository
     */
    private $mock;
    
    /**
     * @var InventoryService
     */
    private $target;

    /**
     * setUp()
     */
    public function setUp()
    {
        parent::setUp();
        $this->mock = $this->initMock(InventoryRepository::class);
        $this->target = $this->app->make(InventoryService::class);
    }

    /**
     * tearDown()
     */
    public function tearDown()
    {
        $this->target = null;
        $this->mock = null;
        parent::tearDown();
    }
    
    public function test_getInventoryList()
    {
        // arrange
        $date = '20180420';
        $expected = [];

        // act
        $this->mock->shouldReceive('getInventoryList')
            ->once()
            ->with($date)
            ->andReturn($expected);
        $actual = $this->target->getInventoryList($date);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_getInventoryitem()
    {
        // arrange
        $cyno = '10000748';
        $expected = new \stdClass();

        // act
        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->getInventoryItem($cyno);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_checkFinished()
    {
        // arrange
        $cyno = '10000748';
        $expected = true;

        // act
        $this->mock->shouldReceive('checkFinished')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->checkFinished($cyno);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_saveInventory()
    {
        // arrange
        $id = 'user_id';
        $cyno = '10000748';
        $item = new \stdClass();
        $locn = 'locn';
        $litm = 'litm';
        $lotn = 'lotn';
        $amount = 0;
        $item->locn = $locn;
        $item->litm = $litm;
        $item->lotn = $lotn;
        $finished = false;
        $expected = new \stdClass();

        // act
        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($item);

        $this->mock->shouldReceive('saveInventory')
            ->once()
            ->with($id, $cyno, $locn, $litm, $lotn, $amount)
            ->andReturn($expected);
        
        $this->mock->shouldReceive('checkFinished')
            ->once()
            ->with($cyno)
            ->andReturn($finished);

        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->saveInventory($id, $cyno, $locn, $litm, $lotn, $amount);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_saveInventory_item_not_equal()
    {
        // arrange
        $id = 'user_id';
        $cyno = '10000748';
        $item = new \stdClass();
        $locn = 'locn';
        $litm = 'litm';
        $lotn = 'lotn';
        $amount = 0;
        $item->locn = 'locn1';
        $item->litm = 'litm1';
        $item->lotn = 'lotn1';
        $finished = false;
        $expected = new \stdClass();

        // act
        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($item);

        $this->mock->shouldReceive('saveInventory')
            ->times(0)
            ->with($id, $cyno, $locn, $litm, $lotn, $amount)
            ->andReturn($expected);
        
        $this->mock->shouldReceive('checkFinished')
            ->once()
            ->with($cyno)
            ->andReturn($finished);

        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->saveInventory($id, $cyno, $locn, $litm, $lotn, $amount);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_saveInventory_is_finished()
    {
        // arrange
        $id = 'user_id';
        $cyno = '10000748';
        $item = new \stdClass();
        $locn = 'locn';
        $litm = 'litm';
        $lotn = 'lotn';
        $amount = 0;
        $item->locn = 'locn1';
        $item->litm = 'litm1';
        $item->lotn = 'lotn1';
        $finished = true;
        $expected = null;

        // act
        $this->mock->shouldReceive('getInventoryItem')
            ->once()
            ->with($cyno)
            ->andReturn($item);

        $this->mock->shouldReceive('saveInventory')
            ->times(0)
            ->with($id, $cyno, $locn, $litm, $lotn, $amount)
            ->andReturn($expected);
        
        $this->mock->shouldReceive('checkFinished')
            ->once()
            ->with($cyno)
            ->andReturn($finished);

        $this->mock->shouldReceive('getInventoryItem')
            ->times(0)
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->saveInventory($id, $cyno, $locn, $litm, $lotn, $amount);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_getInventoried()
    {
        // arrange
        $id = '';
        $cyno = '10000748';
        $check = true;
        $expected = [];

        // act
        $this->mock->shouldReceive('checkInventoryUser')
            ->once()
            ->with($id, $cyno)
            ->andReturn($check);


        $this->mock->shouldReceive('inventoried')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->getInventoried($id, $cyno);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_getInventoried_no_auth()
    {
        // arrange
        $id = '';
        $cyno = '10000748';
        $check = false;
        $expected = '您沒有此盤點單號的權限!';

        // act
        $this->mock->shouldReceive('checkInventoryUser')
            ->once()
            ->with($id, $cyno)
            ->andReturn($check);


        $this->mock->shouldReceive('inventoried')
            ->times(0)
            ->with($cyno);
        try {
            $actual = $this->target->getInventoried($id, $cyno);
        } catch (Exception $e) {
            $actual = $e->getMessage();
        }

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_getExportData()
    {
        // arrange
        $id = '';
        $cyno = '10000748';
        $check = true;
        $expected = [['a'] ,['b']];

        // act
        $this->mock->shouldReceive('checkInventoryUser')
            ->once()
            ->with($id, $cyno)
            ->andReturn($check);

        $this->mock->shouldReceive('exportData')
            ->once()
            ->with($cyno)
            ->andReturn($expected);
        $actual = $this->target->getExportData($id, $cyno);

        // assert
        $this->assertEquals($expected, $actual);
    }

    public function test_getExportData_no_auth()
    {
        // arrange
        $id = '';
        $cyno = '10000748';
        $check = false;
        $expected = [];

        // act
        $this->mock->shouldReceive('checkInventoryUser')
            ->once()
            ->with($id, $cyno)
            ->andReturn($check);

        $this->mock->shouldReceive('exportData')
            ->times(0)
            ->with($cyno);
        $actual = $this->target->getExportData($id, $cyno);

        // assert
        $this->assertEquals($expected, $actual);
    }
}