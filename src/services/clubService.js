import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getMyClubs = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(`${BASE_URL}/api/users/me/clubs`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.data;
};

export const getClubMembers = async (clubId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/members`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.data;
};

export const getClubPosts = async ({ clubId, page = 0, size = 4 }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/posts`, {
    params: {
      page,
      size,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.data;
}

// ai 사용
export const createClubPost = async ({
  clubId,
  title,
  content,
  imageUrls = [],
}) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.post(
    `${BASE_URL}/api/clubs/${clubId}/posts`,
    {
      title,
      content,
      imageUrls,
      postType: "NOTICE",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data.data;
};

export const getClubPostDetail = async (postId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${BASE_URL}/api/posts/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  return response.data.data;
};

export const deleteClubPost = async (postId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.delete(
    `${BASE_URL}/api/posts/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const uploadPostImage = async (postId, file) => {
  const accessToken = localStorage.getItem("accessToken");

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/api/posts/${postId}/image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );
  return response.data.data;
};

export const toggleLike = async (postId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.post(
    `${BASE_URL}/api/posts/${postId}/likes`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data.data;
};

export const createComment = async (postId, content) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.post(
    `${BASE_URL}/api/posts/${postId}/comments`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data.data;
};