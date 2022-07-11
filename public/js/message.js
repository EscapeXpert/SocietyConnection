const delete_tag = document.querySelector("#delete");
const csrfToken = document.querySelector('#csrfToken').value;
const message_type = document.querySelector('#message_type').value;
delete_tag.addEventListener('click', function () {
    const message_ids = [];
    message_ids.push(document.querySelector("#message_id").getAttribute("value"));
    axios.post('/message/delete', {
        message_ids: message_ids,
        _csrf: csrfToken
    })
        .then((response) => {
            if (response.data === 'success') {
                if(message_type === 'receive')
                    location.href = '/message/receive'
                else
                    location.href = '/message/send'
            } else if (response.data === 'not creator') {
                alert("자신의 쪽지만 삭제할 수 있습니다.");
            }
        })
        .catch((err) => {
            console.error(err);
        });
});