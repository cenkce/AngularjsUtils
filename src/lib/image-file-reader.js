/**
 * Created by cenkce on 1/23/16.
 */

ImageFileReader.$inject = ['$q'];

//TODO:refactor to file-reader
function ImageFileReader(p) {
    var $q = p;
    this.read = function(files) {
        var reader = new FileReader(),
            filesData = [],
            prefix = ';base64,';

        var promises = [];

        for (var i = 0, f; f = files[i]; i++) {
            // process for only image files.
            if (!f.type.match('image.*')) {
                throw new Error('file must be image');
                continue;
            }

            var defer = $q.defer();
            promises.push(defer.promise);

            (function (defer, f) {
                reader.onload = function(e) {
                    var data = {};
                    var idx;

                    if(reader.readyState == FileReader.DONE) {
                        data.url = e.target.result;
                        data.idx = data.url.indexOf(prefix);

                        if (data.idx >= 0) {
                            data.base64 = data.url.substring(data.idx + prefix.length);
                        }

                        data.fileName = f.name;
                    }

                    defer.resolve(data);
                };

            })(defer, f);

            reader.readAsDataURL(f);
        }

        return $q.all(promises);
    };
};

angular.module('cenkce.utils').service('cenkce.utils.imageFileReader', ImageFileReader);
