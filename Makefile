install:
	npm install

start:
	node start

build:
	gulp generate-assets

deploy:
	aws s3 sync --acl public-read --cache-control max-age=604800 --delete ./public s3://nhsd.iw-c.co.uk/