$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:5000"
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$userEmail = "phase6-user-$stamp@readnest.local"
$userPassword = "Phase6Pass!123"
$adminEmail = "phase6-admin-$stamp@readnest.local"
$adminPassword = "Phase6Admin!123"
$tmpDir = "D:\WEB\Projects\Read-Nest\server\tmp-phase6"
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

$pdfPath = Join-Path $tmpDir "phase6-test.pdf"
$pngPath = Join-Path $tmpDir "phase6-cover.png"

Set-Content -Path $pdfPath -Value @"
%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 18 Tf 72 96 Td (ReadNest Phase 6 Test) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
"@ -Encoding ascii

[IO.File]::WriteAllBytes($pngPath, [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9W6WQAAAAASUVORK5CYII="))

$health = Invoke-RestMethod -Uri "$base/api/health" -Method Get
$signupBody = @{ name = "Phase 6 User"; email = $userEmail; password = $userPassword } | ConvertTo-Json
$signup = Invoke-RestMethod -Uri "$base/auth/signup" -Method Post -ContentType "application/json" -Body $signupBody
$loginBody = @{ email = $userEmail; password = $userPassword } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$userToken = $login.token
$profile = Invoke-RestMethod -Uri "$base/auth/profile" -Method Get -Headers @{ Authorization = "Bearer $userToken" }

$profileWithoutTokenStatus = ""
try {
  Invoke-RestMethod -Uri "$base/auth/profile" -Method Get | Out-Null
} catch {
  $profileWithoutTokenStatus = $_.Exception.Response.StatusCode.value__
}

$booksInitial = Invoke-RestMethod -Uri "$base/lib/books" -Method Get -Headers @{ Authorization = "Bearer $userToken" }

$env:ADMIN_EMAIL = $adminEmail
$env:ADMIN_PASSWORD = $adminPassword
$env:ADMIN_NAME = "Phase 6 Admin"
node "D:\WEB\Projects\Read-Nest\server\create-admin.js" | Out-Null
Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:ADMIN_NAME -ErrorAction SilentlyContinue

$adminLoginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $adminLoginBody
$adminToken = $adminLogin.token

$curlArgs = @(
  "-s", "-X", "POST", "$base/lib/books",
  "-H", "Authorization: Bearer $adminToken",
  "-F", "title=Phase 6 Backend Test Book",
  "-F", "author=Codex",
  "-F", "description=Temporary book used for backend QA.",
  "-F", "category=Testing",
  "-F", "totalPages=12",
  "-F", "coverImage=@$pngPath;type=image/png",
  "-F", "pdfFile=@$pdfPath;type=application/pdf"
)
$bookCreateRaw = & curl.exe @curlArgs
$bookCreate = $bookCreateRaw | ConvertFrom-Json
$bookId = $bookCreate.data._id

$progressBody = @{ currentPage = 5 } | ConvertTo-Json
$progress = Invoke-RestMethod -Uri "$base/lib/books/$bookId/progress" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $userToken" } -Body $progressBody
$progressFetch = Invoke-RestMethod -Uri "$base/lib/books/$bookId/progress" -Method Get -Headers @{ Authorization = "Bearer $userToken" }

$invalidBookStatus = ""
try {
  Invoke-RestMethod -Uri "$base/lib/books/not-a-valid-id" -Method Get -Headers @{ Authorization = "Bearer $userToken" } | Out-Null
} catch {
  $invalidBookStatus = $_.Exception.Response.StatusCode.value__
}

$unauthorizedBooksStatus = ""
try {
  Invoke-RestMethod -Uri "$base/lib/books" -Method Get | Out-Null
} catch {
  $unauthorizedBooksStatus = $_.Exception.Response.StatusCode.value__
}

$bookDelete = Invoke-RestMethod -Uri "$base/lib/books/$bookId" -Method Delete -Headers @{ Authorization = "Bearer $adminToken" }
$deleteAccount = Invoke-RestMethod -Uri "$base/auth/account" -Method Delete -Headers @{ Authorization = "Bearer $userToken" }

$cleanupScript = @"
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteOne({ email: process.argv[2] });
  await mongoose.disconnect();
})();
"@
$cleanupPath = Join-Path $tmpDir "cleanup-admin.cjs"
Set-Content -Path $cleanupPath -Value $cleanupScript -Encoding ascii
Push-Location 'D:\WEB\Projects\Read-Nest\server'
node $cleanupPath $adminEmail | Out-Null
Pop-Location

$result = [ordered]@{
  healthMessage = $health.message
  signupMessage = $signup.message
  loginMessage = $login.message
  profileEmailMatches = ($profile.user.email -eq $userEmail)
  profileWithoutTokenStatus = $profileWithoutTokenStatus
  booksListOk = ($null -ne $booksInitial.data)
  adminLoginMessage = $adminLogin.message
  bookCreateMessage = $bookCreate.message
  bookIdPresent = [bool]$bookId
  progressMessage = $progress.message
  progressCurrentPage = $progress.data.currentPage
  progressFetchHasData = [bool]$progressFetch.data
  invalidBookStatus = $invalidBookStatus
  unauthorizedBooksStatus = $unauthorizedBooksStatus
  deleteBookMessage = $bookDelete.message
  deleteAccountMessage = $deleteAccount.message
}

$result | ConvertTo-Json -Depth 5
