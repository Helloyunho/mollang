<h2 align="center">
  <br>
  <img src="./mollu.gif" width="200"></img>
  <br>
  <br>
  <span>몰랭 - 몰?루 프로그래밍 언어</span>
  <br>
  <br>
</h2>

```
몰??
모올??.?????

몰루
아모올루

모오올은?행
모올루
털!자

가?자!
```

**현재 언어 버전: `1.1`**

<br>

몰랭(Mollang)은 모바일 게임 블루 아카이브의 밈 ['몰?루'](https://namu.wiki/w/%EB%AA%B0%3F%EB%A3%A8)에서 착안해 설계한 프로그래밍 언어입니다.

본 언어는 [엄랭](https://github.com/rycont/umjunsik-lang)에 깊은 감명을 받고, 이에 기반하여 존경을 담아 제작되었습니다. 다만 기존 엄랭과 약간의 문법상 차이가 존재합니다.   
~~근데 왜 만든건지는 나도 잘 몰?루~~

**구현체는 현재 [C++](./Mollang_C++) 하나가 존재하며 다른 언어(Python, JS, ...)구현은 개발 예정입니다! 언제든지 PR은 환영드립니다!**

# 1. 문법
몰랭의 문법은 `몰`, `루`, `?`, `!`, `.`, `은?행`, `털!자`, `가자!`, `0ㅅ0` 의 9개 키워드와 그 변형으로 이루어집니다.

## 1) 기본 연산자

- `?` (물음표): 1 증가 연산자
- `!` (느낌표): 1 감소 연산자
- `.` (마침표): 두 수 곱하기

</br>

```
?? -> 2
!! -> -2
!!!?? -> -1
??.???! -> 2 * (3 - 1) = 4
??.??.?? -> 8
```

## 2) 변수
### 변수 선언/대입/사용하기
변수들은 각각 정수 인덱스(번째수)를 가지며 아래와 같은 방법으로 나타냅니다. 변수 선언시 기본값이 입력되지 않으면 0으로 초기화됩니다.

첫 변수 이름은 `몰`입니다. 장음을 통해 그 글자수번째 변수를 나타내게 됩니다.

```
몰 -> 첫 번째 변수 선언
모올 -> 두 번째 변수 선언
모오오오오올 -> 여섯 번째 변수 선언
```

<br>

변수 이름 뒤에 연산자를 붙여 그 변수를 선언함과 동시에 정수를 대입합니다.

```
몰?? -> 첫 번째 변수에 2 대입
모올!! -> 두 번째 변수에 -2 대입
모오올??.??.! -> 세 번째 변수에 -4 대입
```

<br>

변수가 이미 선언되어 있다면 변수 이름으로 그 변수의 값을 가져옵니다.

```
1 몰?? -> 첫 번째 변수에 2 대입
2 몰루 -> 2가 출력됩니다.
```

<br>

한 변수를 다른 변수에 대입할 수 있습니다.

```
1 몰? -> 첫 번째 변수에 1 대입
2 모올몰 -> 두 번째 변수에 첫 번째 변수값 대입 (1이 대입됩니다.)
3 모오올몰? -> 세 번째 변수에 첫 번째 변수값 + 1 대입 (2가 대입됩니다.)
```

<br>

한 줄에 세 개 이상의 변수가 있는 경우, 맨 앞의 변수가 대입 대상, 그 이후의 변수들은 값으로 취급됩니다.   
또한 연산자를 이어쓸 수 있듯 변수 여러개를 이어 써도 더하기로 간주합니다.

```
몰모올모오올 -> 첫 번째 변수에 두 번째 변수와 세 번째 변수를 더한 값을 대입합니다. (즉, 몰 = 모올 + 모오올)
```

<br>

줄의 맨 처음에서, 이미 선언된 변수 뒤에 연산자를 붙이면 연산의 결과가 대입됩니다.

```
1 몰?? -> 첫 번째 변수에 2 대입
2 몰??? -> 첫 번째 변수를 3만큼 증가
3 몰! -> 첫 번째 변수를 1만큼 감소
4 몰.??? -> 첫 번째 변수를 3배로
5 몰루 -> 12가 출력됩니다.
```

<br>

하지만 줄이 변수가 아닌 연산자로 시작하는 경우 대입이 아닌 단순 연산으로 간주합니다.

```
1 몰? -> 첫 번째 변수에 1 대입
2 ??몰!루 -> 2 + 1 - 1 = 2이므로, 계산 결과인 2가 출력됩니다.
3 몰루 -> 원래 변수는 변하지 않았으므로 1이 출력됩니다.
```

`루`, `루?`, `은?행`, `아` 키워드와 같이 변수 앞뒤에 키워드가 붙었을 때에도 대입이 아닌 단순 연산으로 간주합니다.

```
1 몰?????????????.????? -> 첫 번째 변수에 65 대입
2 아몰???루 -> 유니코드 코드번호 68인 영문 'D' 출력
3 몰루 -> 원래 변수는 변하지 않았으므로 65가 출력됩니다.
```

## 3) 입출력
### 콘솔 출력 (루)
`루` 키워드를 사용해 콘솔에 정수를 출력합니다.

변수명 뒤에 `루` 키워드를 붙여 변수값을 출력합니다.

```
몰루 -> 콘솔에 첫 번째 변수값 출력
몰?루 -> 콘솔에 첫 번째 변수값 + 1 출력
?몰루 -> 콘솔에 첫 번째 변수값 + 1 출력 (위와 동일)
??루 -> 2 출력
```

### 콘솔 입력 (루?)
`루?` 키워드를 사용해 콘솔로부터 정수를 입력받습니다. 반드시 하나의 온전한 변수만을 앞에 써야 하며 연산자를 사용하면 안 됩니다.

```
몰루? -> 입력값을 첫 번째 변수에 대입
모올루? -> 입력값을 두 번째 변수에 대입
몰모올루? -> 오류 (입력받을 변수가 여러개)
몰?루? -> 오류 (연산자를 사용함)
```

### 유니코드로 문자 출력하기 (아루)
문자를 출력할 때에는 `아` 키워드를 콘솔 출력 문법 앞에 붙입니다. 정수를 UTF-8 문자로 변환하여 콘솔에 출력합니다.

```
아몰루 -> 첫 번째 변수값을 유니코드로 출력
아?????????????.?????루 -> 'A' 출력
```

## 4) 지시문
### 조건문 (은?행 털!자)
조건에 따라 특정 코드를 실행할 수 있습니다.

`{조건식}은?행{실행할 코드}털!자` 의 형태로 사용합니다. 조건식 안의 값이 0이면 코드가 실행되고, 그렇지 않으면 실행되지 않고 바로 다음 코드로 넘어갑니다.   
조건식에는 변수, 연산자를 사용할 수 있습니다.

```
몰은?행모올??털!자 -> 첫 번째 변수가 0이면 두 번째 변수 2 증가
모올!!은?행모오올?털!자 -> 두 번째 변수 - 2가 0이면 세 번째 변수 1 
```

<br>

가독성을 위해(~~의미없지만~~) 여러 줄에 걸쳐 나타낼 수 있습니다. 조건절, 실행할 코드, 종료절의 순서로 개행합니다.

```
몰은?행
모올??
털!자

모올!!은?행
모오올?
털!자
```

<br>

조건문 하나당 실행할 코드는 여러 개가 들어갈수도 있습니다. 또한 조건문 안에 조건문이 중첩되는 경우도 문제없이 수행됩니다.

### 코드 흐름 변경 (가자!)
`가(이동할 라인 숫자)자!` 의 형태로 사용합니다. 특정 라인으로 이동하여 그 라인부터 차례로 실행을 재개합니다.

```
가몰자! -> 첫 번째 변수번째 라인으로 이동
가???자! -> 세 번째 라인으로 이동
```

### 프로그램 종료
`0ㅅ0` 키워드로 프로그램을 종료합니다. 뒤에 변수 또는 연산자가 있으면 그 정수를 반환하면서 종료합니다.

```
0ㅅ0? -> 1 반환하고 종료
```

# 2. 코드 작성
파일 확장자는 `.molu` 입니다.(~~이게 끝?~~)

# 3. 구현체 목록
| 구현 언어                 | 구현 버전 |  추가 날짜  |
|--------------------------|-----------|------------|
| [**C++**](./Mollang_C++) | 1.0       | 2022.02.09 |
| Python3 (예정)           | -         | -          |
| Node.js (예정)           | -         | -          |

## C++구현체 사용방법
실행파일 [다운로드](./Mollang_C++/bin) 혹은 직접 컴파일 후
터미널에서
```
Mollang.exe <molu파일 경로>
```
로 파일을 실행합니다.
인수 없이 실행파일을 실행할 경우, 콘솔에 파일명을 입력하여 출력 결과와 리턴값을 볼 수 있습니다.
