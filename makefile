.PHONY: dist serve

dist:
	./node_modules/.bin/webpack javascript/desktop/init.js dist.js

serve:
	php -S 127.0.0.1 -t ./
