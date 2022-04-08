const User = require("../models/user");
const userVerification = require("../models/userVerification");
const randomString = require("randomstring");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const salt = bcrypt.genSaltSync(10);
const xss = require("xss");
const sgMail = require('@sendgrid/mail')


module.exports = (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("Authentication/sign-up", {
            name: "Sign Up | Market Nest",
            message: errors.array(),
            warning: false,
            csrfToken: req.csrfToken(),
        });
    } else {
        const newUser = {
            full_name: xss(req.body.username),
            email: xss(req.body.email),
            password: req.body.password,
            verified: false,
        };
        User.findOne({ email: newUser.email }, function(err, user) {
            if (err) throw err;

            if (user) {
                res.render("Authentication/sign-up", {
                    name: "Sign Up | Market Nest",
                    message: [],
                    warning: "A user with the entered email is already registered<br> <a href='/sign-up'> Sign up</a>",
                    csrfToken: req.csrfToken(),
                });
            } else {
                const uniqueString = randomString.generate({ length: 80 });
                newUser.password = bcrypt.hashSync(req.body.password, salt);
                User.create(newUser, (err, result) => {
                    if (err) {
                        throw err;
                    } else {

                      const oldDate = new Date();
                      const newDate = new Date();

                      newDate.setTime(oldDate.getTime() + 3 * 60 * 60 * 1000)

                      const verification = {
                          UserId: result.id,
                          uniqueString: uniqueString,
                          expiredAt: newDate
                      };
                      let link = `${req.protocol}://${req.get("host")}/verify?id=${uniqueString}`;
                      console.log(link);
                      userVerification.create(verification, (e, done) => {
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                        const msg = {
                        to: newUser.email,
                        from: {
                            email:'marketnest21@gmail.com',
                            name:'Market Nest'
                        },
                        subject: 'Market Nest Account Verification',
                        html: `<body>
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
                    </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6" data-distribution="1">
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
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="9866248f-ba01-4b29-be81-0b23bce3fbf1" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:18px 0px 18px 0px; line-height:20px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><h1 style="text-align: center"><span style="font-family: &quot;times new roman&quot;, times, serif; color: #1c7cca; font-size: 30px"><strong>MARKET NEST</strong></span></h1><div></div></div></td>
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
                          <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 24px">Thanks for signing up, ${newUser.full_name}!</span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                      <tbody>
                        <tr>
                          <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #000000; font-size: 18px; font-family: arial, helvetica, sans-serif">We are Happy that you have signed up for Market Nest</span><span style="font-size: 18px">.</span></div>
                  <div style="font-family: inherit; text-align: center"><span style="font-size: 18px">To Strat shopping and enjoying our services,&nbsp;</span></div>
                  <div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Kindly confirm your email address.</span></div>
                  <div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px"><strong>Thank you!</strong></span></div><div></div></div></td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
                          </td>
                        </tr>
                      </tbody>
                    </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
                        <tbody>
                          <tr>
                            <td align="center" bgcolor="#ffffff" class="outer-td" style="padding:0px 0px 0px 0px; background-color:#ffffff;">
                              <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                                <tbody>
                                  <tr>
                                  <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                                    <a href=${link} style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Verify Email Now</a>
                                  </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#ffffff">
                          </td>
                        </tr>
                      </tbody>
                    </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
                      <tbody>
                        <tr>
                          <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="6E6E6E">
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
                      </body>`,
                        }
                        sgMail
                            .send(msg)
                            .then(() => {
                                console.log('Email sent')
                                console.log("Unique Id Saved");
                          res.render("Authentication/sign-up", {
                              name: "Sign Up | Market Nest",
                              message: [],
                              warning: "Check your mailbox for verification Process",
                              csrfToken: req.csrfToken(),
                          });
                            })
                            .catch((error) => {
                                console.error(error)
                            })
                          
                      });

                  }
                });
            }
        });
    }
};