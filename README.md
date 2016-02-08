# AngularjsUtils
Angularjs utilities library

#Cropperjs Angular Component and Adapter Application

Usage

```
var app = angular.module('exampleApp', ['cenkce.utils'])
                         .controller('ctrl', ['$scope', function ($scope) {

                            $scope.save = function () {
                                console.log('save');
                                $scope.saveData = $scope.exportCroppedData(250,250).url;
                            };
                        }]);
                        
```

