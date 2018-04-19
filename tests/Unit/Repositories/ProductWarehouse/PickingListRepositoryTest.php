<?php
/**
 * PickingListRepository unit test
 *
 * @version 1.0.2
 * @author spark Lin.yupin@standart.com.tw
 * @date 18/03/20
 * @since 1.0.0 spark: complete 4 test
 * @since 1.0.2 spark: completed unit test and optimized code
 * 
 */
namespace Tests\Unit\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use Exception;
use App\Models\ProductWarehouse\PickingList;
use App\Repositories\ProductWarehouse\PickingListRepository;

/**
 * Class PickingListRepositoryTest
 *
 * @package Tests\Unit\Repositories
 */
class PickingListRepositoryTest extends TestCase
{
    use DatabaseTransactions;
    use WithoutMiddleware;
    
    /**
     * @var PickingListRepository
     */
    private $target;

    /**
     * setUp()
     */
    public function setUp()
    {
        parent::setUp();
        $this->target = $this->app->make(PickingListRepository::class);
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
    
    /**
     * test getPickingList()
     */
    public function test_getPickingList()
    {
        // arrange
        $first = PickingList::first();
        $date = $first->staddj;
        $expected = 
            PickingList::where('staddj', $date)
                ->where('stky6', null)
                ->select('sticu', 'ststop', 'staddj', 'stky2', 'stky1')
                ->orderBy('stky1')
                ->orderBy('ststop')
                ->get();
        
        // act
        $actual = $this->target->getPickingList($date);

        // assert
        $this->assertEquals($expected, $actual);
    }

    /**
     * test getPicking()
     */
    public function test_getPicking()
    {
        // arrange
        $first = PickingList::first();
        $stop = $first->ststop;
        $staddj = $first->staddj;
        $expected = 
            PickingList::where('ststop', $stop)
                ->where('staddj', $staddj)
                ->first();
        
        // act
        $actual = $this->target->getPicking($stop, $staddj);

        // assert
        $this->assertEquals($expected, $actual);
    }

    /**
     * test startPicking()
     */
    public function test_startPicking()
    {
        // arrange
        $stop = 'A1';
        $date = '13-MAR-18';
        $user = '106013';

        // act
        $actual = $this->target->startPicking($stop, $date, $user);

        // assert
        $this->assertTrue($actual);
    }

    /**
     * test endPicking()
     */
    public function test_endPicking()
    {
        // arrange
        $stop = 'A1';
        $date = '13-MAR-18';
        $user = '106013';

        // act
        $actual = $this->target->endPicking($stop, $date, $user);

        // assert
        $this->assertTrue($actual);
    }

    /**
     * test pausePicking
     */
    public function test_pausePicking()
    {
        // arrange
        $stop = 'A1';
        $date = '13-MAR-18';
        $user = '106013';

        // act
        $actual = $this->target->pausePicking($stop, $date, $user);

        // assert
        $this->assertTrue($actual);
    }

    /**
     * test restartPicking
     */
    public function test_restartPicking()
    {
        // arrange
        $stop = 'A1';
        $date = '13-MAR-18';
        $user = '106013';

        // act
        $actual = $this->target->restartPicking($stop, $date, $user);

        // assert
        $this->assertTrue($actual);
    }

    /**
     * test checkPauseState success
     */
    public function checkPauseState_success()
    {
        // arrange
        $stop = '';
        $date = '';

        // act
        


        //assert

    }

    /**
     * test checkPauseState fail
     */
    public function checkPauseState()
    {
        // arrange
        $stop = '';
        $date = '';
    }
}
