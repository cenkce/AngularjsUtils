# AngularjsUtils
Angularjs utilities library

###Cropperjs Angular Component and Application Service

For more info http://cropperjs.com/

- Usage. You can look at examples folder.

```javascript
var app = angular.module('exampleApp', ['cenkce.utils'])
                         .controller('ctrl', ['$scope', function ($scope) {

                            $scope.save = function () {
                                console.log('save');
                                $scope.saveData = $scope.exportCroppedData(250,250).url;
                            };
                        }]);
                        
<div ng-controller="ctrl">
    <input ng-model='photo' class="cropper-file" type="file" value="Yükle" style="display: none;">
    <div class="cropper" cropper>
        <div class="cropperPreview" cropper-preview><img class="cropperPreview-placeholder" src="http://placehold.it/250x250"></div>
        <div class="cropperSave"><img class="cropperPreview-placeholder" ng-src="{{saveData}}" src="http://placehold.it/250x250"></div>
        <div class="cropperPreview-zoom-header">Zoom</div>
        <input type="range" class="cropperPreview-zoom-rangeTool" ng-model="zoom" min="0" max="1" step="0.01">
        <div>
            <a href="" ng-click="fileBrowse();">Load</a>
            <a href=""  ng-click="save()">Save</a>
        </div>
    </div>
</div>
```

###Sharing Component for Facebook and Twitter
 
Example is coming soon

###Google Analytics Component
 
Example is coming soon

###File Reader Component for input file element

Example is coming soon

###Guid Generator Component

Example is coming soon


