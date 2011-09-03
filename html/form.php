<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
    exit(json_encode($_POST));
}
else
{
    sleep(2);
    include(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'form.html');

}

