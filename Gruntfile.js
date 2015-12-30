module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'src/bckgrndfy.js',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                banner: '/* Please see README.md for LICENSE and stuff! */'
            },
            build: {
                files: {
                    'dist/bckgrndfy.min.js': ['src/bckgrndfy.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', [
        'jshint',
        'uglify'
    ]);
    grunt.registerTask('default', ['build']);
};
