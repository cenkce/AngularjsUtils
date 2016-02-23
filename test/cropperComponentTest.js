/**
 * Created by cenkce on 2/22/16.
 */

describe('Cropper Application Service Test', function () {
// Arrange
    var mockScope = {},
        controller,
        log, cropper, $q, $rootScope, $timeout;

    beforeEach(angular.mock.module("cenkce.utils"));

    beforeEach(angular.mock.inject([ '$rootScope', 'cenkce.utils.cropperApp', '$timeout',
        function (rootscope , cropperApp, _$timeout_) {

            cropper = cropperApp;
            $rootScope = rootscope;
            $timeout = _$timeout_;
        }]
    ));

    afterEach(function(){
        //$rootScope.$digest();
    });

    it('injects cropper service',
        function () {
            expect(typeof cropper === 'object').toBe(true);
        }
    );

    it('loads image from url',
        function (done) {
            var timer, src = 'http://localhost:8082/base/test/mock/images/photo.jpg';
                cropper
                    .loadFromUrl(src)
                    .then(
                        function (data) {
                            var element = cropper.getElement();
                            var img = element.find('img');
                            clearInterval(timer);
                            expect(img).toBeDefined();
                            expect(img.attr('src').length).toEqual(501438);
                            done();
                        },
                        function (data) {
                            done.fail('mock image can\'t be loaded');
                        }
                    );

            timer = setInterval($rootScope.$digest, 100);
        }
    );

});
