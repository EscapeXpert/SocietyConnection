if (document.getElementById('img')) {
    document.getElementById('img').addEventListener('change', function (e) {
        const formData = new FormData();
        formData.append('img', this.files[0]);
        axios.post('/profile/<%= User.nickname %>/edit/img', formData)
            .then((res) => {
                document.getElementById('img-url').value = res.data.url;
                document.getElementById('img-preview').src = res.data.url;
                document.getElementById('img-preview').style.display = 'inline';
            })
            .catch((err) => {
                console.error(err);
            });
    });
}
if (document.getElementById('default_profile_image')) {
    document.getElementById('default_profile_image').addEventListener('change', function (e) {
        if (e.currentTarget.checked) {
            document.getElementById('img-preview').src = "/public/icon/default-user-profile-image.svg";
            document.getElementById('img-preview').style.display = 'inline';
        }
    });
}