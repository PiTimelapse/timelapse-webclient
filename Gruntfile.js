var os = require('os');
var replace = require('replace');
module.exports = function (grunt) {
    grunt.initConfig({
        copy: {
            build: {
                files: [
                    {src:"dev/build.html", dest: "prod/index.html"},
                    {expand: true, cwd: "bower_components/platform", src: ['**/**'], dest: "prod/bower_components/platform"},
                    {expand: true, cwd: "bower_components/polymer", src: ['**/**'], dest: "prod/bower_components/polymer"},
                    {expand: true, cwd: "dev/css", src: ['**/**'], dest: "prod/css"}
                ]
            },
            pre: {
                files: [
                    {src:"dev/index.html", dest: "dev/pre.html"},
                ]
            }
        },
        clean: {
            build: {
                src: ['dev/pre.html', 'dev/build.html']
            }
        },
        vulcanize: {
            build: {
                options: {},
                files: {
                    'dev/build.html': "dev/pre.html"
                }
            }
        },
        auto_hostname: {
            build: {
                src: ['dev/pre.html']
            },
            dev: {
                src: ['dev/index.html']
            }
        },
        useminPrepare: {
            html: ['dev/pre.html'],
            options: {
                dest: "prod"
            }
        },
        usemin: {
            html: ['dev/pre.html']
        },
        node_startup: {
            node_exec: "$(which node)"
        }
    });


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-vulcanize');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerMultiTask('auto_hostname', "A task that changes localhost to the right hostname in the public js files", function () {
        var files = this.files.map(function (item) {
            return item.orig.src
        });
        var hostname = os.hostname(),
            realHostname = hostname.indexOf('.local') === -1 ? hostname + ".local" : hostname;
        replace({
            regex: "http://localhost",
            replacement: "http://" + realHostname,
            paths: files[0]
        });
    });

    grunt.registerTask('build', [
        'copy:pre',
        'auto_hostname:build',
        'useminPrepare',
        'concat:generated',
        'uglify:generated',
        'usemin',
        'vulcanize:build',
        'copy:build',
        'clean:build']);
    grunt.registerTask('dev', ['auto_hostname:dev']);
}
