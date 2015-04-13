# EEI #

A roguelike!

## Installation ##

    npm install
    npm install gulp --global
    gulp server

## Development ##

### To compile the code ###

We've configured a [gulpfile](gulpfile.js) that will compile our project; it will read from the ``source`` directory, and write to a ``build`` directory. After everything has been compiled, it can be played from a browser.

	$ gulp

This process is affording us a lot; it concatenates all our scripts through browserify, and it translates all our styles through sass.

### To recompile while you code ###

We're all about iterative development, so we've set up a method for recompiling the project whenever anything is changed. It will report any errors, but won't terminate the process.

	$ gulp watch

### To run a server for the code ###

We also set up a server to host the game as you develop it. It statically builds and serves the code. You can access the server at [localhost:8080](http://localhost:8080).

	$ gulp server

The server will rebuild the project whenever you change something, and if you have [livereload](http://livereload.com) installed in your browser, will automatically refresh.
