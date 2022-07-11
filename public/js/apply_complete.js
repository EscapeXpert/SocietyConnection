const csrfToken = document.querySelector('#csrfToken').value;
const applicants = <%- JSON.stringify(applicants) %>
const applicants_id = [];
const confirm_tag = document.querySelector('#confirm');
confirm_tag.addEventListener('click', async function (event) {
    event.preventDefault();
    for (let applicant of applicants) {
        applicants_id.push(applicant.id);
    }
    await axios.post(`/post/<%= post.id %>/apply/complete`, {
        applicant_id: applicants_id,
        _csrf: csrfToken
    })
        .then((response) => {
            if (response.data === 'success') {
                alert("확정되었습니다.");
                window.opener.location.reload();
                window.close();
            }
        })
        .catch((err) => {
            console.error(err);
        });
});