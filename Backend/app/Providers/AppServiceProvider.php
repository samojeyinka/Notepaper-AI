<?php

namespace App\Providers;

use App\Actions\Sprint\BuildSprintChallengesAction;
use App\Actions\Sprint\CompleteSprintChallengeAction;
use App\Actions\Sprint\CreateSprintAction;
use App\Actions\Sprint\FillSprintChallengeAction;
use App\Actions\StudyPlan\ActivateStudyPlanAction;
use App\Actions\StudyPlan\CreateStudyPlanAction;
use App\Actions\StudyPlan\ToggleStudyPlanTaskAction;
use App\Contracts\Actions\ActivatesStudyPlan;
use App\Contracts\Actions\BuildsSprintChallenges;
use App\Contracts\Actions\CompletesSprintChallenge;
use App\Contracts\Actions\CreatesSprint;
use App\Contracts\Actions\CreatesStudyPlan;
use App\Contracts\Actions\FillsSprintChallenge;
use App\Contracts\Actions\TogglesStudyPlanTask;
use App\Enums\RolesEnum;
use App\Exceptions\NotFoundException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->isLocal()) {
            $loader = \Illuminate\Foundation\AliasLoader::getInstance();
            $loader->alias('Debugbar', \Fruitcake\LaravelDebugbar\Facades\Debugbar::class);
        }

        $this->app->bind(CreatesSprint::class, CreateSprintAction::class);
        $this->app->bind(CompletesSprintChallenge::class, CompleteSprintChallengeAction::class);
        $this->app->bind(FillsSprintChallenge::class, FillSprintChallengeAction::class);
        $this->app->bind(BuildsSprintChallenges::class, BuildSprintChallengesAction::class);
        $this->app->bind(CreatesStudyPlan::class, CreateStudyPlanAction::class);
        $this->app->bind(TogglesStudyPlanTask::class, ToggleStudyPlanTaskAction::class);
        $this->app->bind(ActivatesStudyPlan::class, ActivateStudyPlanAction::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        Broadcast::routes([
            'prefix'     => 'api/v1',
            'middleware' => ['inject_cookie', 'jwt'],
        ]);

        require base_path('routes/channels.php');

        Model::preventsSilentlyDiscardingAttributes($this->app->isLocal());

        // Windows dev: cURL lacks CA bundle, disable SSL verification locally only
        if ($this->app->isLocal()) {
            Http::globalOptions(['verify' => false]);
        }

        // firstOrNotFoundException macro — use instead of abort_if(!$x, 404, '...')
        Builder::macro('firstOrNotFoundException', function (string $message = 'Record not found.') {
            /** @var Builder $this */
            $result = $this->first();

            if (! $result) {
                throw new NotFoundException($message);
            }

            return $result;
        });

        // spatie
        Gate::before(function ($user, $ability) {
            if ($user->hasRole(RolesEnum::SUPER_ADMIN->value)) {
                return true;
            }
        });

        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols();
        });
    }

    // throw exception for unfillable attributes

}
