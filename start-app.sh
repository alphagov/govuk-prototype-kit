#!/bin/bash

node server &
grunt

#DIR=.
#IN_CSS=app/assets/stylesheets
#OUT_CSS=public/stylesheets
#GOVUK_TOOLKIT=node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/stylesheets/

#sass --style expanded --line-numbers --load-path $DIR/$GOVUK_TOOLKIT --watch $DIR/$IN_CSS/application.scss:$DIR/$OUT_CSS/application.css &
#SASS_PID=$!
#trap "kill -9 $SASS_PID; exit 1" INT TERM EXIT
#node server
