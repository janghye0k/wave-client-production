import React, { useCallback, useEffect, useState } from 'react'
import TextField from '@components/Common/TextField'
import * as S from './Login.style'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@redux/hook'
import { userLogin } from '@redux/thunks/userThunks'
import { useAlert } from '@redux/context/alertProvider'
import CheckBox from '@components/Common/Checkbox'
import LoadingPage from '@components/Loading/LoadingPage'
import { useLoginNavigate } from '@redux/context/loginProvider'

interface SigninProps {
  open: boolean
  onClose: () => void
}

const textFieldStyle = {
  width: '100%',
  marginBottom: '1rem',
}

const Login = ({ open, onClose }: SigninProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const openAlert = useAlert()
  const loginNavigate = useLoginNavigate()

  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState({
    username: window.localStorage.getItem('wave_id') || '',
    password: '',
  })
  const [saveID, setSaveID] = useState(
    Boolean(window.localStorage.getItem('wave_id'))
  )
  const [isError, setIsError] = useState({ username: false, password: false })

  const { username, password } = inputValue

  const resetValues = useCallback(() => {
    setInputValue({
      username: window.localStorage.getItem('wave_id') || '',
      password: '',
    })
    setIsError({ username: false, password: false })
  }, [])

  const handleChangeInput = (evnet: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = evnet.currentTarget
    setInputValue({ ...inputValue, [id]: value })
    setIsError({ ...isError, [id]: false })
  }

  const handleChangeSaveID = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget
    setSaveID(checked)
    !checked && window.localStorage.removeItem('wave_id')
  }

  const handleClickRegister = useCallback(() => {
    resetValues()
    onClose()
    navigate('/register')
  }, [navigate, onClose, resetValues])

  const handleClickLogin = useCallback(async () => {
    if (loading) {
      return
    }
    const { username, password } = inputValue

    if (username.length < 6 || username.length > 20) {
      document.getElementById('username')?.focus()
      return alert('6~20 자 사이의 아이디를 입력해주세요.')
    }

    const pwRegex = /(?=.*[a-z|A-Z])(?=.*[0-9])[a-zA-Z0-9#?!@$%^&*-]{6,20}$/

    if (password.length < 6 || password.length > 20) {
      document.getElementById('password')?.focus()
      return alert('6~20 자 사이의 비밀번호를 입력해주세요.')
    }
    if (!pwRegex.test(password)) {
      document.getElementById('password')?.focus()
      return alert('비밀번호는 영문, 숫자 ,특수문자만 이용가능합니다.')
    }

    if (saveID) {
      window.localStorage.setItem('wave_id', username)
    }

    setLoading(true)
    try {
      await dispatch(userLogin(inputValue)).unwrap()
      localStorage.setItem('wave_login', 'true')
      openAlert('로그인 되었습니다.', { severity: 'success' })
      resetValues()
      onClose()
      navigate(location.pathname)
    } catch (status: any) {
      if (status !== 500) {
        const target = status === 401 ? 'password' : 'username'
        setIsError({ ...isError, [target]: true })
        document.getElementById(target)?.focus()
      }
    } finally {
      setLoading(false)
    }
  }, [
    loading,
    inputValue,
    saveID,
    dispatch,
    openAlert,
    resetValues,
    onClose,
    navigate,
    isError,
  ])

  const keyboardEvent = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleClickLogin()
      }
    },
    [handleClickLogin]
  )

  useEffect(() => {
    window.addEventListener('keydown', keyboardEvent)
    return () => {
      window.removeEventListener('keydown', keyboardEvent)
    }
  }, [keyboardEvent])

  useEffect(() => {
    if (open) {
      resetValues()
    }
  }, [open, resetValues])

  return (
    <S.Wrapper>
      {loading ? <LoadingPage /> : <></>}
      <S.Title>
        <h1 className="modal-title">Sign In</h1>
      </S.Title>
      <S.Content>
        <S.Box>
          <form onSubmit={(e) => e.preventDefault()}>
            <TextField
              type="text"
              placeholder="ID"
              autoComplete="off"
              id="username"
              style={textFieldStyle}
              value={username}
              onChange={handleChangeInput}
              error={isError.username}
              errorText="해당하는 아이디를 찾을 수 없습니다."
            />
            <TextField
              type="password"
              autoComplete="off"
              placeholder="Password"
              id="password"
              style={textFieldStyle}
              value={password}
              onChange={handleChangeInput}
              error={isError.password}
              errorText="잘못된 비밀번호 입니다."
            />
          </form>
        </S.Box>
        <S.Box className="signin-loginbox">
          <CheckBox
            id="saveID"
            label="아이디저장"
            checked={saveID || false}
            onChange={handleChangeSaveID}
          />
          <S.LoginButton onClick={handleClickLogin}>로그인</S.LoginButton>
        </S.Box>
        <S.Box className="signin-more">
          <div className="signin-find">
            <button onClick={() => loginNavigate('find_id')}>
              아이디 찾기
            </button>
            <span style={{ margin: '0 4px' }}>{`|`}</span>
            <button onClick={() => loginNavigate('find_password')}>
              비밀번호 찾기
            </button>
          </div>
          <span className="siginin-register">
            <Link to="register" onClick={handleClickRegister}>
              회원가입
            </Link>
          </span>
        </S.Box>
      </S.Content>
    </S.Wrapper>
  )
}

export default React.memo(Login)
