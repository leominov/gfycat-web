.PHONY: dist

dist:
	./node_modules/.bin/webpack javascript/desktop/init.js dist.js
