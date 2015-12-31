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
                    'dist/bckgrndfy-no-voronoi.min.js': ['src/bckgrndfy.js']
                }
            }
        },
        concat: {
            options: {
                separator: ';\n'
            },
            dist: {
                src: ['node_modules/voronoi/rhill-voronoi-core.min.js', 'dist/bckgrndfy-no-voronoi.min.js'],
                dest: 'dist/bckgrndfy.min.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', [
        'jshint',
        'uglify',
        'concat'
    ]);
    grunt.registerTask('default', ['build']);
};
