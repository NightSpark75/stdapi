<?php

namespace App\Http\Controllers\MPZ;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Repositories\MPZ\PointlogRepository;

class PointlogController extends Controller
{
    //
    private $pointlog;
    private $program;

    public function __construct(PointlogRepository $pointlog)
    {
        $this->pointlog = $pointlog;
        $this->program = 'SMAF0030';
        session(['program' => $this->program]);
        $this->middleware('role');
    }

    public function init()
    {
        $result = $this->pointlog->init();
        $response = response()->json($result);
        return $response;
    }

    public function check($point_no)
    {
        $result = $this->pointlog->check($point_no);
        $response = response()->json($result);
        return $response;
    }
}