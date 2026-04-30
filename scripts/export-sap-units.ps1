$ErrorActionPreference = 'Stop'

function Invoke-WikiJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing $Url
            return ($response.Content | ConvertFrom-Json)
        } catch {
            if ($attempt -eq 3) {
                throw
            }
            Start-Sleep -Seconds (2 * $attempt)
        }
    }
}

function New-WikiApiUrl {
    param(
        [hashtable]$Params
    )

    $queryPairs = foreach ($key in $Params.Keys) {
        $encodedKey = [uri]::EscapeDataString([string]$key)
        $encodedValue = [uri]::EscapeDataString([string]$Params[$key])
        "$encodedKey=$encodedValue"
    }

    return 'https://superautopets.wiki.gg/api.php?' + ($queryPairs -join '&')
}

function Clean-WikiText {
    param(
        [string]$Text
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ''
    }

    $value = $Text
    $value = $value -replace '\r', ''
    $value = $value -replace '\n+', ' '
    $value = $value -replace '\{\{IconSAP\|attack\|nolink=yes\}\}', 'ATK'
    $value = $value -replace '\{\{IconSAP\|health\|nolink=yes\}\}', 'HP'
    $value = $value -replace '\{\{IconSAP\|mana\|nolink=yes\}\}', 'Mana'
    $value = $value -replace '\{\{IconSAP\|gold\|nolink=yes\}\}', 'Gold'
    $value = $value -replace '\{\{IconSAP\|trumpet\|nolink=yes\}\}', 'Trumpet'
    $value = $value -replace '\{\{IconSAP\|([^}|]+)(?:\|[^}]*)?\}\}', '$1'
    $value = $value -replace '\[\[([^|\]]+)\|([^\]]+)\]\]', '$2'
    $value = $value -replace '\[\[([^\]]+)\]\]', '$1'
    $value = $value -replace "'''", ''
    $value = $value -replace "''", ''
    $value = $value -replace '<[^>]+>', ''
    $value = $value -replace '\{\{[^}]+\}\}', ''
    $value = $value -replace '\s+', ' '
    return $value.Trim()
}

function Extract-Field {
    param(
        [string]$Content,
        [string]$FieldName
    )

    $pattern = "(?ms)\|$([regex]::Escape($FieldName))\s*=\s*(.*?)(?=\n\|[A-Za-z0-9_/\- ]+\s*=|\n\}\})"
    $match = [regex]::Match($Content, $pattern)
    if ($match.Success) {
        return (Clean-WikiText $match.Groups[1].Value)
    }
    return ''
}

$apiBase = 'https://superautopets.wiki.gg/api.php'
$pageTitles = New-Object System.Collections.Generic.List[string]
$continueToken = $null

do {
    $queryParams = @{
        action = 'query'
        list = 'categorymembers'
        cmtitle = 'Category:Pets'
        cmtype = 'page'
        cmlimit = '500'
        format = 'json'
    }
    if ($continueToken) {
        $queryParams.cmcontinue = $continueToken
    }
    $query = New-WikiApiUrl -Params $queryParams

    $result = Invoke-WikiJson -Url $query
    foreach ($item in $result.query.categorymembers) {
        if ($item.title -ne 'Pets') {
            $pageTitles.Add($item.title)
        }
    }

    $continueToken = $null
    if ($result.continue -and $result.continue.cmcontinue) {
        $continueToken = $result.continue.cmcontinue
    }
} while ($continueToken)

$knownPacks = @(
    'Turtle Pack',
    'Puppy Pack',
    'Star Pack',
    'Golden Pack',
    'Unicorn Pack',
    'Danger Pack',
    'Mini Pack 1',
    'Mini Pack 2',
    'Custom Packs'
)

$records = New-Object System.Collections.Generic.List[object]
$chunkSize = 20

for ($i = 0; $i -lt $pageTitles.Count; $i += $chunkSize) {
    $chunk = $pageTitles[$i..([Math]::Min($i + $chunkSize - 1, $pageTitles.Count - 1))]
    $titlesParam = [string]::Join('|', $chunk)
    $query = New-WikiApiUrl -Params @{
        action = 'query'
        prop = 'revisions'
        rvprop = 'content'
        rvslots = 'main'
        titles = $titlesParam
        format = 'json'
        formatversion = '2'
    }
    $result = Invoke-WikiJson -Url $query

    foreach ($page in $result.query.pages) {
        if (-not $page.revisions) {
            continue
        }

        $content = $page.revisions[0].slots.main.content
        if ($content -match '^#REDIRECT') {
            continue
        }

        $tier = Extract-Field -Content $content -FieldName 'tier'
        $stats = Extract-Field -Content $content -FieldName 'attack/health'
        $level1 = Extract-Field -Content $content -FieldName 'level_1'
        $level2 = Extract-Field -Content $content -FieldName 'level_2'
        $level3 = Extract-Field -Content $content -FieldName 'level_3'

        $categories = @([regex]::Matches($content, '\[\[Category:([^\]]+)\]\]') | ForEach-Object { $_.Groups[1].Value })
        $packs = $categories | Where-Object { $_ -in $knownPacks }
        $isToken = $categories -contains 'Token'
        $kind = if ($isToken) { 'Token' } else { 'Pet' }

        $records.Add([pscustomobject]@{
            Title = $page.title
            Kind = $kind
            Tier = $tier
            Stats = $stats
            Packs = if ($packs) { ($packs -join ', ') } else { '-' }
            Level1 = $level1
            Level2 = $level2
            Level3 = $level3
        })
    }
}

$tierOrder = @{
    '1' = 1
    '2' = 2
    '3' = 3
    '4' = 4
    '5' = 5
    '6' = 6
}

$sortedPets = @($records |
    Where-Object { $_.Kind -eq 'Pet' } |
    Sort-Object @{ Expression = { if ($tierOrder.ContainsKey($_.Tier)) { $tierOrder[$_.Tier] } else { 999 } } }, Title)

$sortedTokens = @($records |
    Where-Object { $_.Kind -eq 'Token' } |
    Sort-Object Title)

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# Super Auto Pets Units Reference')
$lines.Add('')
$lines.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') UTC")
$lines.Add('')
$lines.Add('Source: https://superautopets.wiki.gg/wiki/Pets and individual unit pages via the wiki API.')
$lines.Add('')
$lines.Add("Main pets found: $($sortedPets.Count)")
$lines.Add("Tokens found: $($sortedTokens.Count)")
$lines.Add('')
$lines.Add('## Pets')
$lines.Add('')
$lines.Add('| Unit | Tier | Stats | Packs | Level 1 | Level 2 | Level 3 |')
$lines.Add('| --- | --- | --- | --- | --- | --- | --- |')

foreach ($unit in $sortedPets) {
    $title = $unit.Title.Replace('|', '\|')
    $stats = $unit.Stats.Replace('|', '\|')
    $packs = $unit.Packs.Replace('|', '\|')
    $level1 = $unit.Level1.Replace('|', '\|')
    $level2 = $unit.Level2.Replace('|', '\|')
    $level3 = $unit.Level3.Replace('|', '\|')
    $lines.Add("| $title | $($unit.Tier) | $stats | $packs | $level1 | $level2 | $level3 |")
}

$lines.Add('')
$lines.Add('## Tokens')
$lines.Add('')
$lines.Add('| Unit | Tier | Stats | Packs | Level 1 | Level 2 | Level 3 |')
$lines.Add('| --- | --- | --- | --- | --- | --- | --- |')

foreach ($unit in $sortedTokens) {
    $title = $unit.Title.Replace('|', '\|')
    $stats = $unit.Stats.Replace('|', '\|')
    $packs = $unit.Packs.Replace('|', '\|')
    $level1 = $unit.Level1.Replace('|', '\|')
    $level2 = $unit.Level2.Replace('|', '\|')
    $level3 = $unit.Level3.Replace('|', '\|')
    $lines.Add("| $title | $($unit.Tier) | $stats | $packs | $level1 | $level2 | $level3 |")
}

$outputPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\docs\design\SAP-UNITS.md'))
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($outputPath, $lines, $utf8NoBom)
