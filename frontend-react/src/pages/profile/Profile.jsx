import Field from "../../components/profile/Field";
import PaymentMethods from "../../components/profile/PaymentMethods";
import Preferences from "../../components/profile/Preferences";
import "./profile.css";
import ProfilCard from "../../components/profile/profilCard";
import PersonalInfo from "../../components/profile/PersonalInfo";
import ProfileAddress from "../../components/profile/ProfileAddress";
import { useEffect, useState } from "react";
import {BACKEND_URL} from  "../../../../options"

const Profile = () => {
    const [profile, setProfile] = useState(null);

 useEffect(() => {
  const getProfile = async () => {
    try {
      const res = await fetch(BACKEND_URL + "user/profile", {
        credentials: "include",
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  getProfile();
}, []);
  return (
    <div className="profile-page">
      <h1 className="page-title">Profile Settings</h1>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <ProfilCard data={profile} />
        </aside>

        <main className="profile-content">
          <PersonalInfo data={profile} />
          <ProfileAddress data={profile} />
          <PaymentMethods />
          <Preferences />
        </main>
      </div>
    </div>
  );
};

export default Profile;
