"use client";
import { useState } from "react";
import scss from "./Profile.module.scss";
import { useProfile } from "@/hooks/auth/useProfile";
import { useLogout } from "@/hooks/auth/useLogout";
import { useEditProfile } from "@/hooks/auth/useEditProfile";
import { useForm } from "react-hook-form";
import AuthGuard from "@/components/layout/auth/AuthGuard";
import { API_URL } from "@/lib/config";

interface IForm {
  name: string;
  avatar: any;
  description: string;
}

const ProfileContent = () => {
  const { data: profile } = useProfile();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: editProfile } = useEditProfile();
  const { reset, register, handleSubmit } = useForm<IForm>();
  const handleData = (data: IForm) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);

    if (data.avatar?.[0]) {
      formData.append("avatar", data.avatar[0]);
    }
    editProfile(formData, {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };
  return (
    <div className={scss.container}>
      <div className={scss.mainContainer}>
        <div className={scss.cover} />
        <div className={scss.profileContent}>
          <div className={scss.profileTop}>
            <div className={scss.avatar}>
              <img
                src={
                  profile?.avatar?.startsWith("http")
                    ? profile.avatar
                    : profile?.avatar
                      ? `${API_URL}/uploads/${profile.avatar}`
                      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVntI8W66S4tpgqvs7Hap-E5_hdgwEzn_EtkT8HnIRwh6x-s4RwUMnwWA&s=10"
                }
                alt={profile?.name}
              />
            </div>
          </div>

          <div className={scss.info}>
            <h1>{profile?.name}</h1>
            <p className={scss.username}>@{profile?.email}</p>

            <p className={scss.bio}>
              {profile?.description || "Добавьте описание"}
            </p>

            <div className={scss.meta}>
              <span>📍 Bishkek, Kyrgyzstan</span>
              <span>🔗 {profile?.name}.dev</span>
              <span>📅 Joined: {profile?.created_at}</span>
            </div>
          </div>
          <div className={scss.actions}>
            <button
              className={scss.editButton}
              onClick={() => {
                reset({
                  name: profile?.name || "",
                  description: profile?.description || "",
                });
                setIsOpen(true);
              }}
            >
              Edit profile
            </button>
            <button onClick={() => logout()} className={scss.logoutButton}>
              Log out of account
            </button>
          </div>
          {isOpen && (
            <>
              <form onSubmit={handleSubmit(handleData)}>
                <div
                  className={scss.backgroundEdit}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={scss.modalEdit}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h1>Edit profile</h1>

                    <input
                      {...register("name")}
                      type="text"
                      placeholder="Name"
                    />
                    <div className={scss.description}>
                      <label
                        className={scss.label}
                        htmlFor="description"
                      ></label>

                      <textarea
                        {...register("description")}
                        className={scss.textarea}
                        id="description"
                        placeholder="Write a description..."
                        rows={6}
                      />
                    </div>
                    <label className={scss.fileUpload}>
                      <input
                        {...register("avatar")}
                        type="file"
                        className={scss.input}
                      />
                      <img
                        src={
                          profile?.avatar
                            ? `${API_URL}/uploads/${profile.avatar}`
                            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVntI8W66S4tpgqvs7Hap-E5_hdgwEzn_EtkT8HnIRwh6x-s4RwUMnwWA&s=10"
                        }
                        alt={profile?.name}
                      />

                      <div className={scss.icon}>📁</div>

                      <div className={scss.text}>Выбрать файл</div>

                      <div className={scss.hint}>PNG, JPG, PDF до 10 МБ</div>
                    </label>
                    <button type="submit">Save</button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Profile = () => (
  <AuthGuard service="your profile">
    <ProfileContent />
  </AuthGuard>
);

export default Profile;
