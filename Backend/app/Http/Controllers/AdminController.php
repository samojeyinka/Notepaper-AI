<?php

namespace App\Http\Controllers;

use App\Exports\UserExport;
use App\Http\Requests\VerifyIdsRequest;
use App\Http\Resources\UserCollection;
use App\QueryFilters\UserFilter;
use App\Services\AdminService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AdminController extends Controller
{
    public function __construct(protected AdminService $adminService) {}

    public function users(Request $request)
    {
        $filter = new UserFilter($request);
        $users = $this->adminService->users($filter);

        return new UserCollection($users);
    }

    // export users
    public function export()
    {
        return Excel::download(new UserExport, 'users.xlsx');
    }

    // destroy

    public function destroy(VerifyIdsRequest $request)
    {
        $ids = (array) $request->input('ids'); // cast single value to array

        $this->adminService->destroy($ids);

        return $this->successResponse('User(s) has been deleted successfully!', null, 201);

    }

    // restore soft deleted user

    public function restore(VerifyIdsRequest $request)
    {
        $ids = (array) $request->input('ids'); // cast single value to array
        $this->adminService->restore($ids);

        return $this->successResponse('User(s) has been restored');
    }

    public function forceDestroy(VerifyIdsRequest $request)
    {
        $ids = (array) $request->input('ids'); // cast single value to array
        $this->adminService->forceDestroy($ids);

        return $this->successResponse('User(s) has been deleted fully');
    }

    public function trashed(Request $request)
    {
        $filter = new UserFilter($request);
        $users = $this->adminService->trashed($filter);

        return new UserCollection($users);
    }
}
