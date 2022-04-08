const User = require("../models/user");
const userVerification = require("../models/userVerification");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const sgMail = require('@sendgrid/mail')


module.exports = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: errors.array() });
    } else {
        User.findOne({ email: req.body.email }, (err, result) => {
            
            if (result === null) {
                res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: "No User with the email address" });
            } else {
                if (result.facebookId !== undefined) {
                    res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: "This mail was used to sign up with facebook" });

                } else {
                    if (result.googleId !== undefined) {
                        res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: "This mail was used to sign up with Google" });
                    } else {
                        const uniqueString = randomString.generate({ length: 80 });

                        let link = `http://${req.get("host")}/usr/new-password?id=${uniqueString}`;


                        //Send User Token and link to change password
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                        
                        const msg = {
                        to: result.email,
                        from: {
                            email:'marketnest21@gmail.com',
                            name:'Market Nest'
                        },
                        subject: 'Market Nest Reset Password',
                        html:` <body>
                        <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                          <div class="webkit">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                              <tr>
                                <td valign="top" bgcolor="#FFFFFF" width="100%">
                                  <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td width="100%">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                          <tr>
                                            <td>
                                              <!--[if mso]>
                      <center>
                      <table><tr><td width="600">
                    <![endif]-->
                                                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                        <tr>
                                                          <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                      <tr>
                        <td role="module-content">
                          <p></p>
                        </td>
                      </tr>
                    </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#30AADD" data-distribution="1">
                      <tbody>
                        <tr role="module-content">
                          <td height="100%" valign="top"><table width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                        <tbody>
                          <tr>
                            <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="331cde94-eb45-45dc-8852-b7dbeb9101d7">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="043fd4d4-6add-48c4-80dd-6b08fb722e4a">
                      <tbody>
                        <tr>
                          <td style="padding:18px 0px 18px 0px; line-height:40px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><h1 style="text-align: center"><span style="color: #ffffff">MARKET NEST</span></h1><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="27716fe9-ee64-4a64-94f9-a4f28bc172a0">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#30AADD;" height="100%" valign="top" bgcolor="#30AADD" role="module-content"><div><div style="font-family: inherit"><span style="color: #ffffff; font-family: Colfax, Helvetica, Arial, sans-serif; font-size: 24px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; background-color: #30AADD">We received a request to reset your&nbsp;</span></div>
                  <div style="font-family: inherit"><span style="color: #ffffff; font-family: Colfax, Helvetica, Arial, sans-serif; font-size: 24px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: pre-wrap; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline; background-color: #30AADD">Market Nest password.</span><span style="background-color: #30AADD">&nbsp;</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#30AADD;" height="100%" valign="top" bgcolor="#30AADD" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px; color: #ffffff">Need to reset your password? No problem! Just click the button below and you’ll be on your way.</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#30AADD">
                          </td>
                        </tr>
                      </tbody>
                    </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
                        <tbody>
                          <tr>
                            <td align="center" bgcolor="#30AADD" class="outer-td" style="padding:0px 0px 0px 0px; background-color:#30AADD;">
                              <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                                <tbody>
                                  <tr>
                                  <td align="center" bgcolor="#333C83" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                                    <a href=${link} style="background-color:#333C83; border:1px solid #30AADD; border-color:#30AADD; border-radius:0px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Reset Password</a>
                                  </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="fcdda9ce-3cae-49d1-90e3-31f34e7df053">
                      <tbody>
                        <tr>
                          <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit"><br></div>
                  <div style="font-family: inherit"><span style="font-family: Consolas, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 14px; line-height: 19px; white-space: pre; color: #ffffff; background-color: #30AADD">If you did not make this request, please ignore this email.</span><span style="color: #ffffff; background-color: #30AADD">&nbsp;</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#30AADD">
                          </td>
                        </tr>
                      </tbody>
                    </table></td>
                          </tr>
                        </tbody>
                      </table></td>
                        </tr>
                      </tbody>
                    </table></td>
                                                        </tr>
                                                      </table>
                                                      <!--[if mso]>
                                                    </td>
                                                  </tr>
                                                </table>
                                              </center>
                                              <![endif]-->
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </center>
                      </body>`
                    }
                   
                     const oldDate = new Date();
                     const newDate = new Date();

                            newDate.setTime(oldDate.getTime() + 3 * 60 * 60 * 1000)

                            const verification = {
                                UserId: result.id,
                                uniqueString: uniqueString,
                                expiredAt: newDate
                            };


                            userVerification.create(verification, (e, done) => {
                                if (e) {
                                    console.log(e);
                                } else {
                                    sgMail
                                    .send(msg)
                                    .then(() => {
                                        console.log('Email sent')
                                    })
                                    .catch((error) => {
                                        console.error(error)
                                    })
                                    console.log("Unique Id Saved");
                                    res.render("Authentication/forgotPassword", { name: "Forgot Password", csrfToken: req.csrfToken(), error: "Check your mailbox for further instructions" });

                                }

                            });

                        
                  
                    }
                }
            }

        });
    }


};