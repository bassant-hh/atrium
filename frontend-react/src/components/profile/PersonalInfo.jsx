import React from 'react'

const PersonalInfo = () => {
  return <>
   <section className="info-card">
            <div className="info-card__header">
              <div>
                <h3 className="info-card__title">Personal Information</h3>
                <p className="info-card__subtitle">Your account details</p>
              </div>
              <button className="info-card__edit-btn">Edit</button>
            </div>

            <div className="info-card__grid">
              {[
                { label: "Full Name", value: "Ahmed Ali" },
                {
                  label: "Email Address",

                  value: "ahmed@email.com",
                },
                {
                  label: "Phone Number",

                  value: "+20 01090035043",
                },
                { label: "Student ID", value: "U20240123" },
              ].map(({ label, icon, value }) => (
                <div key={label}>
                  <p className="info-card__field-label">{label}</p>
                  <div className="info-card__field">
                    <span className="info-card__field-icon">{icon}</span>
                    <span className="info-card__field-value">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
  </>
}

export default PersonalInfo