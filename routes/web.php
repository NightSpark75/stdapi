<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('index');
});

Route::get('welcome', function () {
    return view('welcome');
});

Route::get('error', function () {
    return view('error');
});

Route::get('phpinfo', function () {
    phpinfo();
});

Route::get('pdo', function () {
    dd (DB::connection()->getPdo());
});

Route::get('thanks', function () {
    return view('thanks');
})->name('thanks');

Route::get('testWeb', function() {
    return 'testWeb';
})->middleware('auth');

// ReactJs 須認證的頁面
Route::get('/auth/{path?}', function($path = null){
        return View::make('index');
})->where('path', '.*')->middleware('auth'); 

// ReactJs 一般頁面
Route::get('/{path?}', function($path = null){
        return View::make('index');
})->where('path', '.*'); 
