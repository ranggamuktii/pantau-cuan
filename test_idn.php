<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.idnfinancials.com/id/company");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
]);
$result = curl_exec($ch);
file_put_contents('test_idn.json', substr($result, 0, 500));
echo "Done";
