
export const $pages = {

    register: {// Register new user page
      title: 'Register',
      message: "Welcome to places. As a registered users you'll get unrestricted access to all the features",
      caption: 'Register with my email' 
    }, 
    signIn: {// Regular sign-in page
      title: 'Sign-in',
      message: "We're glad to see you again. Please sign-in",
      caption: 'Sign-in with my email' 
    },
    forgotPassword: {// Ask for password reset page
      title: 'Reset password',
      message: "We'll be sending a link to reset the password to your inbox",
      caption: 'Reset the password' 
    },
    resetPassword: {// Reset to a new password page (2nd step after forgotPassword)
      title: 'New password',
      caption: 'Change the password' 
    },
    changePassword: {// Change the password (while authenticated)
      title: 'Change password',
      message: "Please confirm by re-authenticating",
      caption: 'Change your password' 
    },
    changeEmail: {// Change the email 
      title: 'Change email',
      message: "Please confirm by re-authenticating",
      caption: 'Change your email'
    },
    promptEmail: {// Change the email 
      title: "Email verification",
      message: "An email has been sent to your address..."
    },
    verifyEmail: {// Change the email 
      title: "Email verification",
      message: "Thank you for verifying your email. You might need to sign-in again before seeing the effects"
    },
    recoverEmail: {// Change the email 
      title: "Email recovery",
      message: "Your previous email has been restored. We recommend changing your password the soonest"
    },
    delete: {// Delete the user account
      title: 'Delete account',
      message: "WARNING! Confirmimg with your password the account will be permanently deleted",
      caption: 'delete the account' 
    }
  };