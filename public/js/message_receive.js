function checkSelectAll() {
    const checkboxes = document.querySelectorAll('input[name="check"]');
    const checked = document.querySelectorAll('input[name="check"]:checked');
    const selectAll = document.querySelector('input[name="select_all"]');

    if (checkboxes.length === checked.length) {
        selectAll.checked = true;
    } else {
        selectAll.checked = false;
    }
}

function selectAll(selectAll) {
    const checkboxes = document.getElementsByName('check');

    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll.checked
    })
}

const delete_tag = document.querySelector("#delete");
delete_tag.addEventListener('click', async function (event) {
    event.preventDefault();
    const checked = document.querySelectorAll("input#check:checked");
    const message_ids = [];
    for (let i of checked) {
        message_ids.push(i.getAttribute("value"))
    }
    await axios.post('/message/delete', {
        message_ids: message_ids
    }).then((response) => {
        if (response.data === 'success') {
            location.href = '/message/receive/?page=<%= page %>';
        } else if (response.data === 'not creator') {
            alert("자신의 쪽지만 삭제하실 수 있습니다.");
        }
    })
        .catch((err) => {
            console.error(err);
        });
});