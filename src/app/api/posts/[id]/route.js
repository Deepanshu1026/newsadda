import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readDatabase, writeDatabase } from "../../../../../services/db";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const posts = await readDatabase();

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;

    // Save updated database
    await writeDatabase(posts);

    return NextResponse.json({ success: true, views: posts[postIndex].views });
  } catch (error) {
    console.error("[Views API] Error incrementing count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const posts = await readDatabase();

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingPost = posts[postIndex];
    
    // Calculate new read time if content is provided
    let readTime = existingPost.readTime;
    if (body.content) {
      const wordsCount = body.content.split(/\s+/).length;
      readTime = `${Math.max(3, Math.ceil(wordsCount / 200))} min read`;
    }

    // Merge updated fields
    const updatedPost = {
      ...existingPost,
      title: body.title !== undefined ? body.title : existingPost.title,
      description: body.description !== undefined ? body.description : existingPost.description,
      category: body.category !== undefined ? body.category : existingPost.category,
      author: body.author !== undefined ? body.author : existingPost.author,
      image: body.image !== undefined ? body.image : existingPost.image,
      content: body.content !== undefined ? body.content : existingPost.content,
      readTime,
      updatedAt: new Date().toISOString()
    };

    posts[postIndex] = updatedPost;

    // Save database
    await writeDatabase(posts);

    // Flush cache for pages
    revalidatePath("/");
    revalidatePath(`/posts/${id}`);
    revalidatePath(`/category/${updatedPost.category.toLowerCase()}`);
    revalidatePath(`/author/${encodeURIComponent(updatedPost.author)}`);

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("[Edit API] Error updating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const posts = await readDatabase();

    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postToDelete = posts[postIndex];

    // Filter out the post
    const updatedPosts = posts.filter(p => p.id !== id);

    // Save database
    await writeDatabase(updatedPosts);

    // Flush cache for pages
    revalidatePath("/");
    revalidatePath(`/posts/${id}`);
    revalidatePath(`/category/${postToDelete.category.toLowerCase()}`);
    revalidatePath(`/author/${encodeURIComponent(postToDelete.author)}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete API] Error deleting post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

