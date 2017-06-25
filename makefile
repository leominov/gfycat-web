.PHONY: dist serve

dist:
	./node_modules/.bin/webpack public/javascript/desktop/init.js public/dist.js

serve:
	php -S 127.0.0.1 -t public/
