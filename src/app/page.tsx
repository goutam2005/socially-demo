import { getPosts } from "@/actions/post.action";
import { getUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

const homepage = async () => {
  const user = await currentUser();
  const Posts = await getPosts();
  const CurrentUserId = await getUserId()
  if (CurrentUserId instanceof Error) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}
        <div className="space-y-6">
          {Posts?.map((post) => (
            <PostCard post={post} key={post.id} UserId={CurrentUserId} />
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 hidden lg:block sticky-top-20">
        <WhoToFollow />
      </div>
    </div>
  );
};

export default homepage;
