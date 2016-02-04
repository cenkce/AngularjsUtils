/**
 * Created by cenkce on 1/22/16.
 */

CropperService.$inject = ['cenkce.imageFileReader', '$rootScope', '$window', '$q'];

var CropServiceEvents = {
    imageLoaded :'cropper:image-loaded',
    imageSelected:'cropper:image-selected',
    EXIFFetched:'cropper:exif-fetched',
    completed:'cropper:completed',
    cropped:'cropper:cropped'
};

function CropperService(imageReader, $rootScope, $window, $q){
    var _that = this, _cropper = $window.cropper, waitingRotation = 0, temp, _isDirty = false,
        _config = {
            dragMode: 'move',
            scalable:false,
            aspectRatio: 1,
            restore: false,
            minCropBoxWidth:230,
            checkOrientation : false,
            guides: false,
            toggleDragModeOnDblclick:false,
            center: false,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false
        },
        _image = new Image;

    if(typeof Cropper === 'undefined')
        throw new Error('Croppperjs is not found.');

    function setDirty(value){
        _isDirty = value;
    }

    this.setElement = function (image) {
        _image = image;
    };

    this.getElement = function () {
        return _image;
    };

    this.setConfig = function (config) {
        _config = angular.copy(config);
    };

    this.getConfig = function () {
        angular.copy(_config);
    };

    this.exportData = function () {
        if(!_cropper)
            return;

        var prefix = ';base64,';
        var data   = {};
        var img    = new Image();

        var canvas = _cropper.getCroppedCanvas({width:w, height:h});
        data.url = canvas.toDataURL("image/jpeg", 1.0);

        img.src = data.url;

        if(!data.url)
            return false;

        data.idx = data.url.indexOf(prefix);

        if (data.idx >= 0) {
            data.base64 = data.url.substring(data.idx + prefix.length);
        }

        data.fileName = generateUUID()+'.jpg';
        return data;
    };

    function drawImage(image) {
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;

        var ctx = tempCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        return tempCanvas.toDataURL();
    };

    this.zoomTo = function (value) {
        _cropper.zoomTo(value);
    };

    this.rotate = function (degree) {
        _cropper.rotate(degree);
    };

    this.getCropper = function () {
        return _cropper;
    };

    this.load = function(files){
        setDirty(true);
        var defer = $q.defer();

        _config.cropend = function (e, action) {
        };

        if(files.length > 1)
            throw new Error('Multi-files are not supported');

        if($window.EXIF === undefined)
            throw new Error('exif-js cannot be found.');

        imageReader.read(files).then(function (data) {
            if(!data[0].url){
                throw new Error('File data is not readable');
            }

            _image.src = data[0].url;

            _image.onload = function () {
                //var img = new Image;
                setDirty(false);

                //IOS auto rotation hack
                _image.src = drawImage(_image);

                _image.onload = function () {
                    defer.notify({message:CropServiceEvents.imageLoaded, complete: function () {
                        _cropper = new Cropper(_image, _config);

                        _that.zoomTo(0.5);

                        //detects image orientation and rotates it by orientation.
                        EXIF.getData(files[0], function() {
                            defer.notify({message:CropServiceEvents.EXIFFetched});

                            switch(this.exifdata.Orientation){
                                case 8:
                                    _cropper.rotate(-90);
                                    break;
                                case 3:
                                    _cropper.rotate(180);
                                    break;
                                case 6:
                                    _cropper.rotate(90);
                                    break;
                                default:

                                    break;
                            }

                            defer.notify({message:CropServiceEvents.completed, complete: function () {
                                defer.resolve();
                            }});
                        });

                    }, cancel: function () {
                        defer.reject();
                    }});
                    //Creates new Cropper instance and injects hacked image to
                };
            };

            _image.src = data[0].url;
        });

        return defer.promise;
    }
}

CropperComponent.$inject = ['cenkce.cropperService'];

function CropperComponent($cropper){
    var _btn, _image = new Image;
    $cropper.setElement(_image);
    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.$watch('zoom', function (newV, oldV) {
                if(newV)
                    $scope.zoomTo(newV);
            });

            $scope.zoomTo = function (val) {
                $cropper.zoomTo(val);
            };

            $scope.exportCroppedData = function (w, h) {
                $cropper.exportData();
            };

            $scope.fileBrowse = function () {
                console.log('browse');
                _btn[0].click();
            };
        }],
        controllerAs:'cropperCtrl',
        scope:true,
        link: function ($scope, elem, attrs) {
            //File input
            _btn = elem.find('input[type=file]');

            //file input is not found.
            if(_btn.length == 0){
                _btn = angular.element('<input type=\'file\' style="display: none;" >');
                elem.append(_btn);
            }
            //file input source is changed by user
            _btn.bind('change', function (e) {
                $cropper.load(e.target.files).then(
                    //completed
                    function (data) {
                       console.log('completed');
                    },
                    //error
                    function (data) {

                    },
                    //messages
                    function (data) {
                        console.log('messages : ',data);
                        if(data.message == CropServiceEvents.imageLoaded) {
                            $scope.addPreview($cropper.getElement());
                            data.complete();
                        } else if(data.message == CropServiceEvents.completed) {
                            data.complete();
                        }
                    }
                );
            });

            $scope.$on('$destroy', function () {
                _btn.unbind('change');
                _btn = null;
            });
        }
    }
}

function CropperComponentPreview(){
    return {
        requie:'?cropper',
        restrict:'A',
        link: function ($scope, elem, attrs) {
            $scope.addPreview = function(element){
                elem.html('');
                elem.append(element);
            }
        }
    }
};

angular.module('cenkce.utils').service('cenkce.cropperService', CropperService);
angular.module('cenkce.utils').directive('cropper', CropperComponent);
angular.module('cenkce.utils').directive('cropperPreview', CropperComponentPreview);
