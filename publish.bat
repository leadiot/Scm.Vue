cd dist/

rmdir /s /q material-icons

rmdir /s /q material-symbols

rmdir /s /q scicon

del config.js

del favicon.ico

del favicon.svg

del index_bootcdn.html

del index_cdn.html

del index_unpkg.html

del report.html

rmdir /s /q "..\..\..\Release\Scm.Net\Scm.Web\wwwroot\static"

xcopy /e /y /i * "..\..\..\Release\Scm.Net\Scm.Web\wwwroot\"

rmdir /s /q "..\..\..\Release\Nas.Net\Nas.Web\wwwroot\static"

xcopy /e /y /i * "..\..\..\Release\Nas.Net\Nas.Web\wwwroot\"