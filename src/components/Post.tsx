import { FC } from "react";

interface PostProps {
  content: string;
}

const Post: FC<PostProps> = ({ content }) => {
  return <div className="post">{content}</div>;
};

export default Post;
