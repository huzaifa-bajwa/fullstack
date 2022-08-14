const curUserId = parseInt(document.getElementById("user_id").value)

const Delete = (props) => {

    const deletePost = (e) => {
        e.preventDefault()
        $.post("/post/delete", { postID: props.postID }, function (data) {
            if (data == "Accepted") {
                alert("Post deleted successfully")
                props.reloadFunction((cur) => !cur)
            }
            else alert("Error")
        })
    }
    return (
        <form action="/post/delete" method="POST" onSubmit={deletePost}>

            <input type="hidden" value={props.postID}></input>
            <button type="submit" className="border bg-red-600 text-white px-1 items-center rounded-md"><i className="fa-solid fa-xmark text-sm"></i> Delete</button>

        </form>
    )
}

const Form = (props) => {

    const [content, setContent] = React.useState("")

    const post = (e) => {

        e.preventDefault()
        $.post("/post/new", { content: content }, function (data) {
            if (data == "Created") {
                alert("Post created successfully")
                props.reloadFunction((cur) => !cur)
            }
            else alert("Error")
        })
    }

    return (
        <section className="mt-8 w-3/4 m-auto bg-white p-12 pt-10 rounded-md bg-opacity-90">

            <h2 className="text-2xl font-bold">Create a post</h2>

            <form id="post-form" action="/post/new" method="POST" onSubmit={post} className="w-full mt-2 flex flex-row">

                <textarea id="post-content" name="content" value={content} onChange={(e) => { setContent(e.target.value) }} placeholder="What`s on your mind?" className="border-2 w-full px-3 py-2"></textarea>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white float-right px-2 py-2 min-w-max rounded-md"><i className="fa-solid fa-paper-plane"></i>Post Now</button>

            </form>

        </section>
    )
}

const Posts = () => {

    const [posts, setPosts] = React.useState([])
    const [reload, setReload] = React.useState(false)

    React.useEffect(() => {

        fetch("/post/all")
            .then((data) => {
                data.json()
                    .then((jsonData) => {
                        setPosts(jsonData)
                    })
            })
            .catch((err) => {
                console.log(err)
            })
    }, [reload])

    return (

        <div>

            <Form reloadFunction={setReload} />

            {posts.map((post, index) => (

                <div className="mt-8 w-8/12 m-auto bg-white px-8 py-12 rounded-md flex gap-x-4 bg-opacity-90" key={index}>

                    <i className="fa-solid fa-user-pen text-8xl"></i>

                    <div className="w-full">

                        <div className="flex justify-between items-center">

                            <h3 className="text-lg font-bold">{post.name}</h3>
                            <span className="text-gray-400 text-sm">{post.date_posted}</span>

                        </div>

                        <p>{post.content}</p>
                        <br></br>
                        {post.user_id == curUserId ? <Delete postID={post.id} reloadFunction={setReload} /> : <a></a>}

                    </div>

                </div>))}
        </div>
    )

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<Posts />)