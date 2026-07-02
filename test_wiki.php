<?php
$url = 'https://id.wikipedia.org/wiki/Daftar_emiten_di_Bursa_Efek_Indonesia';
$html = file_get_contents($url);

$tickers = [];
// Use regex to find all 4-letter uppercase words inside specific table cells or links
// Actually on Wikipedia, tickers are usually inside <td><a href="..." title="...">XXXX</a></td>
if (preg_match_all('/>([A-Z]{4})<\/a>/', $html, $matches)) {
    $tickers = array_unique($matches[1]);
    sort($tickers);
    echo "Found " . count($tickers) . " tickers.\n";
    file_put_contents('wiki_tickers.json', json_encode(array_values($tickers), JSON_PRETTY_PRINT));
} else {
    echo "No tickers found.\n";
}
