<?php

namespace App\Http\Controllers\Native;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Repositories\Native\PadRepository;

class PadController extends Controller
{
    //
    private $pad;

    public function __construct(PadRepository $pad)
    {
        $this->pad = $pad;
    }

    public function download($app)
    {
        $result = $this->pad->downloadBundle($app);
        
        if ($result['result']) {
            $file = $result['file'];
            $decode = base64_decode($file);
            $name = 'index.android.bundle';
            /*
            $response = response($decode)
                ->header('Content-Disposition', 'attachment; filename=' . $name);
            */
            $response = response($decode);
            return $response;
        }
        return $result['msg'];
    }

    public function version($app)
    {
        $result = $this->pad->getVersion($app);
        return response()->json($result);
    }

    public function upload()
    {
        return view('service.bundleUpload');
    }

    public function apkUpload()
    {
        return view('service.apkUpload');
    }

    public function apkDownload($app)
    {
        $result = $this->pad->downloadApk($app);
        
        if ($result['result']) {
            $file = $result['file'];
            $version = $result['version'];
            $decode = base64_decode($file);
            $name = "stdapp-$version.apk";
    
            $response = response($decode)->header('Content-Disposition', 'attachment; filename=' . $name);
            return $response;
        }
        return $result['msg'];
    }

    public function save()
    {
        $version = request()->input('version');
        $file = request()->file('bundle');
        $result = $this->pad->saveBundle($version, $file);
        return response()->json($result);
    }

    public function apkSave()
    {
        $version = request()->input('version');
        $file = request()->file('apk');
        $result = $this->pad->saveApk($version, $file);
        return response()->json($result);
    }
}
