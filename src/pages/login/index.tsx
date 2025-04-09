
/*
* @Author: dushuai
* @Date: 2024-03-29 16:13:37
 * @LastEditors: dushuai
 * @LastEditTime: 2024-08-19 21:42:49
* @description: login
*/
import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, useSubmit } from 'react-router-dom';

function Login() {
  const [params] = useSearchParams();
  const sumbit = useSubmit();

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  useEffect(() => {
    if(['/', '/login'].includes(pathname)) {
      navigate('/');
    }
  }, [pathname]);

  function handleLogin() {
    const token = 'test-tokentokentokentokentokentokentokentokentokentokentokentokentoken';
    sumbit({ token, redirectTo: params.get('from') || '/' }, { method: 'post', replace: true });
  }

  return (
    <>
      <button onClick={handleLogin}>
        登陆
      </button>
    </>
  );
}

export default Login;
