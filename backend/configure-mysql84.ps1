$ErrorActionPreference = 'Stop'

$mysqlHome = 'C:\Program Files\MySQL\MySQL Server 8.4'
$programData = 'C:\ProgramData\MySQL\MySQL Server 8.4'
$dataDirectory = Join-Path $programData 'Data'
$configuration = Join-Path $programData 'my.ini'
$sourceConfiguration = Join-Path $PSScriptRoot 'mysql84.ini'
$server = Join-Path $mysqlHome 'bin\mysqld.exe'

New-Item -ItemType Directory -Force $programData | Out-Null
Copy-Item -LiteralPath $sourceConfiguration -Destination $configuration -Force

if (-not (Test-Path (Join-Path $dataDirectory 'mysql'))) {
  New-Item -ItemType Directory -Force $dataDirectory | Out-Null
  & $server --defaults-file=$configuration --initialize-insecure --console
  if ($LASTEXITCODE -ne 0) {
    throw "MySQL data directory initialization failed with exit code $LASTEXITCODE"
  }
}

$service = Get-Service -Name 'MySQL84' -ErrorAction SilentlyContinue
if (-not $service) {
  & $server --install MySQL84 --defaults-file=$configuration
  if ($LASTEXITCODE -ne 0) {
    throw "MySQL84 service installation failed with exit code $LASTEXITCODE"
  }
}

Start-Service -Name 'MySQL84'
Set-Service -Name 'MySQL84' -StartupType Automatic
