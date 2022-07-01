const board_id = document.querySelector('#board_id').value;
const board_type = document.querySelector('#board_type').value;
const keyword = document.querySelector('#keyword').value;
const keyword_m = document.querySelector('#keyword_m').value;
const sort_by_create_tag = document.querySelector('#sort_by_created_at');
sort_by_create_tag.addEventListener('click', async function (event) {
    event.preventDefault();
    location.href = `/board/${board_id}/?sort=created_at&keyword=${keyword}`;
});
const sort_by_create_m_tag = document.querySelector('#sort_by_created_at_m');
sort_by_create_m_tag.addEventListener('click', async function (event) {
    event.preventDefault();
    location.href = `/board/${board_id}/?sort=created_at&keyword=${keyword_m}`;
});

if (board_type === 'general') {
    const sort_by_like_tag = document.querySelector('#sort_by_like');
    sort_by_like_tag.addEventListener('click', async function (event) {
        event.preventDefault();
        location.href = `/board/${board_id}/?sort=like&keyword=${keyword}`;
    });

    const sort_by_like_m_tag = document.querySelector('#sort_by_like_m');
    sort_by_like_m_tag.addEventListener('click', async function (event) {
        event.preventDefault();
        location.href = `/board/${board_id}/?sort=like&keyword=${keyword_m}`;
    });
} else if (board_type === 'recruitment') {
    const sort_by_deadline_tags = document.querySelectorAll('#sort_by_deadline');
    sort_by_deadline_tags.forEach(sort_by_deadline_tag => {
        sort_by_deadline_tag.addEventListener('click', async function (event) {
            event.preventDefault();
            location.href = `/board/${board_id}/?sort=deadline&keyword=${keyword}`;
        });
    });
    const sort_by_after_deadline_tags = document.querySelectorAll('#sort_by_after_deadline');
    sort_by_after_deadline_tags.forEach(sort_by_after_deadline_tag => {
        sort_by_after_deadline_tag.addEventListener('click', async function (event) {
            event.preventDefault();
            location.href = `/board/${board_id}/?sort=after_deadline&keyword=${keyword}`;
        });
    });
}