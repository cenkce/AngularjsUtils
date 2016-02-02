/**
 * Created by cenkce on 1/22/16.
 */

CropperService.$inject = ['cenkce.imageFileReader', '$rootScope', '$window'];
CropperComponent.$inject = ['cenkce.cropperService'];

var CropServiceEvents = {
    imageSelected:'cropper:image-selected',
    EXIFFetched:'cropper:exif-fetched'
};

function CropperService(imageReader, $rootScope, $window){
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
        };

    if(typeof Cropper === 'undefined')
        throw new Error('Croppperjs is not found.');

    function setDirty(value){
        _isDirty = value;
    }

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
        var image = new Image;

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

            image.src = data[0].url;

            image.onload = function () {
                //var img = new Image;
                $rootScope.$broadcast(CropServiceEvents.imageSelected);

                //IOS auto rotation hack
                image.src = drawImage(image);

                image.onload = function () {
                    //Creates new Cropper instance and injects hacked image to
                    _cropper = new Cropper(image, _config);

                    _that.zoomTo(0.5);

                    //detects image orientation and rotates it by orientation.
                    EXIF.getData(e.target.files[0], function() {
                        $rootScope.$broadcast(CropServiceEvents.EXIFFetched);
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
                        }
                    });

                };
            };

            image.src = data[0].url;
        });

        return image;
    }
}

function CropperComponent($cropper){
    var btn;

    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {

            this.zoomTo = function (val) {
                $cropper.zoomTo(val);
            };

            this.exportCroppedData = function (w, h) {
            };

            this.fileBrowse = function () {
                console.log('browse');
                console.log(btn);
                btn[0].click();
            };
        }],
        controllerAs:'cropperCtrl',
        link: function ($scope, elem, attrs) {
            //File input
            btn = elem.find('input[type=file]');

            if(btn.length == 0){
                btn = angular.element('<input type=\'file\' value="Gözat" style="display: none;" >');
                elem.append(btn);
            }

            btn.bind('change', function (e) {
                $cropper.load(e.target.files);
            });

            $scope.$on('$destroy', function () {
                btn.unbind('change');
                btn = null;
                cropper = null;
                range = null;
            });
        }
    }
}

angular.module('cenkce.utils').service('cenkce.cropperService', CropperService);
angular.module('cenkce.utils').directive('cropper', CropperComponent);
