export const WINSAT_POWERSHELL_SCRIPT = `$w = Get-CimInstance -ClassName Win32_WinSAT
$scores = [ordered]@{
  CPU      = [double]$w.CPUScore
  D3D      = [double]$w.D3DScore
  Disk     = [double]$w.DiskScore
  Graphics = [double]$w.GraphicsScore
  Memory   = [double]$w.MemoryScore
}
$avg = ($scores.Values | Measure-Object -Average).Average
$min = ($scores.Values | Measure-Object -Minimum).Minimum

function Get-Category([double]$v) {
  if ($v -le 3) { 'Low end' }
  elseif ($v -le 5) { 'Average' }
  elseif ($v -le 7) { 'Good' }
  else { 'Very high' }
}

$scores.GetEnumerator() | ForEach-Object {
  [PSCustomObject]@{
    Component = $_.Key
    Score     = "{0:N2}" -f $_.Value
    Category  = Get-Category $_.Value
  }
} | Format-Table -AutoSize

""
"Average (mean) : {0:N2}" -f $avg
"WinSPRLevel (base) : {0:N2}" -f $min
"Average category : $(Get-Category $avg)"`;
