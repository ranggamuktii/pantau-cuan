<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.idx.co.id/primary/MasterData/GetCompanyProfiles?language=id-id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer: https://www.idx.co.id/'
]);
$result = curl_exec($ch);
file_put_contents('test_idx.json', substr($result, 0, 500));
echo "Done";
