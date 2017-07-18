(function(){
    'use strict';

    angular
        .module('starter')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$log', '$scope', '$state', '$window', '$location', '$stateParams', 'header', '$document', '$mdDialog', 'login', 'httpRequests', 'ngProgressFactory', 'icons'];

    function HomeController($log, $scope, $state, $window, $location, $stateParams, header, $document, $mdDialog, login, httpRequests, ngProgressFactory, icons){
        var inspectQuery = $stateParams.inspect || '';
        var vm = this;
        vm.icons = icons;
        vm.publicLink = 'https://uni-muenster.sciebo.de/index.php/s/G8vxQ1h50V4HpuA';
        vm.useExample = useExample;
        vm.submit = submitter;
        vm.openDialog = openDialog;
        vm.openMenu = openMenu;
        //vm.loggedIn = login.isLoggedIn;
        vm.user = {};
        vm.isLoggedIn;
        vm.sendScieboUrl = sendScieboUrl;
        vm.validUrl = true;
        vm.ercID = inspectQuery;
        activate();
        
        $scope.$on('setUser', function(){
            vm.user = login.getUser();
            vm.loggedIn = login.isLoggedIn();
            $log.debug(vm.user);
        });

        $scope.$on('$destroy', function(){
            $mdDialog.cancel();
            vm.scieboUrl = '';
            vm.scieboPath = '';
        });
        ///////////

        if($window.location.href.indexOf('shareURL') >= 0){
            parseURL($window.location.href);
        }
        
        ///////////
        //Working example: http://localhost/#!/home?shareURL=https://uni-muenster.sciebo.de/index.php/s/m7k16mNmfDbSO0P&path=/metatainer
        function parseURL(url){
            url = url.split('%2F').join('/');
            vm.scieboUrl = url.split('shareURL=')[1].split('&')[0];
            vm.scieboPath = url.split('path=/')[1];
        }

        function sendScieboUrl(url, path, analysis){
            var progressbar = ngProgressFactory.createInstance();
			progressbar.setHeight('3px');
			progressbar.start();

            var id;
            httpRequests
                .uploadViaSciebo(url, path)
                .then(scieboCallback)
                .catch(errorHandler);

            function scieboCallback(response){
                id = response.data.id;
                if(analysis){
                    httpRequests
                        .newJob({compendium_id: id})
                        .then(goToCreation)
                        .catch(errorHandler);
                } else {
                    goToCreation();
                }
            }

            function goToCreation(){
                progressbar.complete();
                $location.path('/creationProcess/' + id);
            }

            function errorHandler(err){
                $log.debug(err);
                progressbar.complete();
            }
            /*
            httpRequests
                .uploadViaSciebo(url, path)
				.then(function (response) {
                    vm.validUrl=true;
					httpRequests
                        .singleCompendium(response.data.id)
						.then(responseMetadata)
						.catch(errorHandlerMetadata);

					function responseMetadata(data){
						progressbar.complete();
						$location.path('/creationProcess/' + data.data.id);
					}	

					function errorHandlerMetadata(err){
						$log.debug(err);
						progressbar.complete();
					}
				})
				.catch(function errorHandler(err){
					$log.debug(err);
					progressbar.complete();
                    vm.validUrl=false;
				});	
                */
        }

        function activate(){
            header.setTitle('o2r - opening reproducible research');
            login.getUserCall();
        }

        function submitter(id){
            $state.go('erc', {ercid: id});
        };

        function openDialog(ev){
            $mdDialog.show({
                controller: 'UploadModalController',
                controllerAs: 'vm',
                templateUrl: 'app/upload/uploadModal.html',
                parent: $document[0].body,
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false
            });
        }

        function openMenu($mdMenu, ev){
            $mdMenu.open(ev);
        }

        function useExample(publicLink, folder){
            vm.scieboPath = folder;
            vm.scieboUrl = publicLink;
        }
    }
})();