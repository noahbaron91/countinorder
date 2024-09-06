import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import './dialog.css';
import './hide-scrollbar.css';

function NumberElement({
  number,
  isHighestNumber,
}: {
  number: number;
  isHighestNumber: boolean;
}) {
  const className = isHighestNumber
    ? 'text-gray-50 min-w-16 text-center number-element'
    : 'text-gray-500 min-w-16 text-center number-element';

  return (
    <motion.p
      initial={{ opacity: 0, y: -35 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {number}
    </motion.p>
  );
}

function GitHubIcon() {
  return (
    <svg
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M16 2C8.265 2 2 8.265 2 16C2 22.195 6.0075 27.4275 11.5725 29.2825C12.2725 29.405 12.535 28.985 12.535 28.6175C12.535 28.285 12.5175 27.1825 12.5175 26.01C9 26.6575 8.09 25.1525 7.81 24.365C7.6525 23.9625 6.97 22.72 6.375 22.3875C5.885 22.125 5.185 21.4775 6.3575 21.46C7.46 21.4425 8.2475 22.475 8.51 22.895C9.77 25.0125 11.7825 24.4175 12.5875 24.05C12.71 23.14 13.0775 22.5275 13.48 22.1775C10.365 21.8275 7.11 20.62 7.11 15.265C7.11 13.7425 7.6525 12.4825 8.545 11.5025C8.405 11.1525 7.915 9.7175 8.685 7.7925C8.685 7.7925 9.8575 7.425 12.535 9.2275C13.655 8.9125 14.845 8.755 16.035 8.755C17.225 8.755 18.415 8.9125 19.535 9.2275C22.2125 7.4075 23.385 7.7925 23.385 7.7925C24.155 9.7175 23.665 11.1525 23.525 11.5025C24.4175 12.4825 24.96 13.725 24.96 15.265C24.96 20.6375 21.6875 21.8275 18.5725 22.1775C19.08 22.615 19.5175 23.455 19.5175 24.7675C19.5175 26.64 19.5 28.145 19.5 28.6175C19.5 28.985 19.7625 29.4225 20.4625 29.2825C23.2418 28.3443 25.6568 26.5581 27.3677 24.1753C29.0786 21.7926 29.9993 18.9334 30 16C30 8.265 23.735 2 16 2Z'
        fill='#78716C'
      />
    </svg>
  );
}

function FailedNumberElement({ number }: { number: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -35, color: '#fafaf9' }}
      animate={{ opacity: 1, y: 0, color: '#FF4141' }}
      className='min-w-16 text-center number-element'
    >
      {number}
    </motion.p>
  );
}

function CloseIcon() {
  return (
    <svg
      className='w-6 sm:w-7'
      width='24'
      height='25'
      viewBox='0 0 24 25'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6.29289 6.79289C6.68342 6.40237 7.31658 6.40237 7.70711 6.79289L12 11.0858L16.2929 6.79289C16.6834 6.40237 17.3166 6.40237 17.7071 6.79289C18.0976 7.18342 18.0976 7.81658 17.7071 8.20711L13.4142 12.5L17.7071 16.7929C18.0976 17.1834 18.0976 17.8166 17.7071 18.2071C17.3166 18.5976 16.6834 18.5976 16.2929 18.2071L12 13.9142L7.70711 18.2071C7.31658 18.5976 6.68342 18.5976 6.29289 18.2071C5.90237 17.8166 5.90237 17.1834 6.29289 16.7929L10.5858 12.5L6.29289 8.20711C5.90237 7.81658 5.90237 7.18342 6.29289 6.79289Z'
        fill='#A8A29E'
      />
    </svg>
  );
}

const WEBSOCKET_HOST = import.meta.env.VITE_BACKEND_WEBSOCKET_HOST;

if (!WEBSOCKET_HOST) {
  throw new Error('VITE_BACKEND_HOST not found');
}

const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;

if (!BACKEND_HOST) {
  throw new Error('VITE_BACKEND_HOST not found');
}

const useAttempts = ({
  filter,
  page,
}: {
  filter: AttemptFilter;
  page: number;
}) => {
  const [data, setData] = useState<
    { id: number; created_at: string; max_count: number }[]
  >([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await fetch(
          `${BACKEND_HOST}/v1/attempts?filter=${filter}&page=${page}`
        );
        const { data, hasNextPage } = await response.json();

        console.log({ hasNextPage });

        setData(data);
        setHasNextPage(hasNextPage);
      } catch (error) {
        // todo: auto retry after 1 second
        console.error('Error fetching attempts', error);
      }
    };

    fetchAttempts();
  }, [filter, page]);

  return { data, hasNextPage };
};

type Attempt = { max_count: number; id: number; created_at: string };

function getTimeSince(utcTimestamp: string): string {
  // Parse the UTC timestamp
  const pastDate = new Date(utcTimestamp);
  const now = new Date();
  const nowInUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  // Calculate the difference in milliseconds
  const diffMs = nowInUTC.getTime() - pastDate.getTime();

  // Convert milliseconds to different units
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Return a human-readable string
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
  }
}

function PreviousAttempt({ attempt }: { attempt: Attempt }) {
  const timeSince = getTimeSince(attempt.created_at);

  return (
    <div className='flex flex-col'>
      <p className='text-gray-50 text-lg sm:text-xl'>{attempt.max_count}</p>
      <p className='text-gray-400 text-lg'>{timeSince}</p>
    </div>
  );
}

function PreviousAttemptDialogPage({
  filter,
  page,
  isLastPage,
  onLoadMore,
}: {
  filter: AttemptFilter;
  page: number;
  isLastPage: boolean;
  onLoadMore: () => void;
}) {
  const { data, hasNextPage } = useAttempts({ page, filter });

  return (
    <div className='flex flex-col gap-4'>
      {data.map((attempt) => (
        <PreviousAttempt attempt={attempt} key={attempt.id} />
      ))}

      {isLastPage && hasNextPage && (
        <button
          className='bg-gray-800 py-2 text-gray-50 border border-gray-700 rounded'
          type='button'
          onClick={onLoadMore}
        >
          Load more
        </button>
      )}
    </div>
  );
}

function PreviousAttemptDialogContent({ type }: { type: AttemptFilter }) {
  const [pages, setPages] = useState(1);

  return (
    <>
      <div className='flex flex-col max-h-72 overflow-y-scroll gap-4'>
        {Array.from({ length: pages }).map((_, i) => (
          <PreviousAttemptDialogPage
            key={i}
            filter={type}
            page={i + 1}
            onLoadMore={() => setPages(pages + 1)}
            isLastPage={i + 1 === pages}
          />
        ))}
      </div>
      <div id='load-more'></div>
    </>
  );
}

type AttemptFilter = 'latest' | 'top';

function PreviousAttemptsDialog() {
  const [type, setType] = useState<AttemptFilter>('latest');

  const handleValueChange = (value: string) => {
    if (value !== 'latest' && value !== 'top') {
      return;
    }

    setType(value);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger className='underline text-lg'>
        Previous attempts
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='DialogOverlay fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50' />
        <Dialog.Content className='DialogContent flex gap-8 sm:w-[450px] flex-col px-5 py-6 max-w-[90vw] rounded-2xl w-80 bg-gray-900 border border-gray-800 z-30 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <Dialog.Title className='text-gray-50 text-2xl'>
                Attempts
              </Dialog.Title>
              <Dialog.Close>
                <CloseIcon />
              </Dialog.Close>
            </div>
            <RadioGroup.Root
              value={type}
              onValueChange={handleValueChange}
              className='bg-gray-900 border border-gray-800 rounded-lg px-2 flex py-[6px]'
            >
              <RadioGroup.Item
                className='py-1 text-center flex-1 text-gray-50 data-[state=checked]:bg-gray-800 rounded'
                value='latest'
              >
                Previous
              </RadioGroup.Item>
              <RadioGroup.Item
                className='text-center flex-1 text-gray-50 data-[state=checked]:bg-gray-800 rounded py-1'
                value='top'
              >
                Best
              </RadioGroup.Item>
            </RadioGroup.Root>
          </div>
          <div style={{ display: type === 'latest' ? 'block' : 'none' }}>
            <PreviousAttemptDialogContent type='latest' />
          </div>
          <div style={{ display: type === 'top' ? 'block' : 'none' }}>
            <PreviousAttemptDialogContent type='top' />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function App() {
  const [inputValue, setInputValue] = useState('');

  const websocketRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [elements, setElements] = useState<Set<number>>(new Set([]));

  // TODO: remove this
  const [key, rerender] = useState(Math.random());

  const [scope, animate] = useAnimate();
  const [failedNumber, setFailedNumber] = useState<null | number>(null);
  const [highscore, setHighscore] = useState<null | number>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      console.log('Message from server ', event.data);
      try {
        const parsedData = JSON.parse(event.data as string);

        switch (parsedData.type) {
          case 'initial': {
            const previousElements = Array.from({ length: 10 }).map(
              (_, i) => parsedData.value - i
            );

            const previousElementsGreaterThanZero = previousElements.filter(
              (value) => value > 0
            );

            setElements(new Set([...previousElementsGreaterThanZero]));

            setHighscore(parsedData.highScore);

            console.log('is here!!');

            break;
          }
          case 'count-updated': {
            if (elements.size === 0) {
              console.log(elements.size);
              return;
            }

            const highestNumber = Math.max(...elements);

            if (parsedData.value > highestNumber) {
              const difference = parsedData.value - highestNumber;

              const additionalElements: number[] = [];

              Array.from({
                length: difference,
              }).map((_, i) => {
                additionalElements.push(highestNumber + i + 1);
              });

              setElements(
                (prevElements) =>
                  new Set([...prevElements, ...additionalElements])
              );
            }

            if (highscore && parsedData.value > highscore) {
              setHighscore(parsedData.value);
            }

            break;
          }
          case 'failed': {
            setFailedNumber(parsedData.value);

            setTimeout(() => {
              animate(
                '.number-element',
                { opacity: 0, y: 500 },
                {
                  ease: 'backInOut',
                  duration: 0.75,
                  onComplete: () => {
                    setFailedNumber(null);
                    setElements(new Set([1]));
                    // TODO: Find a better way to rerender
                    rerender(Math.random());
                  },
                }
              );
            }, 300);

            console.log('Failed to update count');
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [animate, elements, highscore]
  );

  const handleError = useCallback((error: Event) => {
    console.log('Error connecting to server', error);
  }, []);

  const handleClose = useCallback((event: CloseEvent) => {
    // TODO: handle reconnection
    console.log('Connection closed', event);
  }, []);

  const handleOpen = useCallback((event: Event) => {
    if (!websocketRef.current) return;

    console.log('Connected to server', event);
    console.log('Sending initial message...');

    websocketRef.current.send(JSON.stringify({ type: 'initial' }));
  }, []);

  useEffect(() => {
    if (!websocketRef.current) {
      const host = `${WEBSOCKET_HOST}/v1/websocket`;
      websocketRef.current = new WebSocket(host);
    }

    const websocket = websocketRef.current;

    websocket.addEventListener('open', handleOpen);
    websocket.addEventListener('close', handleClose);
    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('error', handleError);

    return () => {
      websocket.removeEventListener('open', handleOpen);
      websocket.removeEventListener('message', handleMessage);
      websocket.removeEventListener('error', handleError);
      websocket.removeEventListener('close', handleClose);
    };
  }, [elements, handleClose, handleError, handleMessage, handleOpen]);

  const handleSubmit = async () => {
    const websocket = websocketRef.current;

    if (!websocket) {
      return;
    }

    const inputNumberValue = Number.parseInt(inputValue, 10);
    console.log({ inputNumberValue });

    // TODO: Error handling
    if (Number.isNaN(inputNumberValue)) {
      console.error('Input is not a number', { input: inputValue });
      return;
    }

    const isAnInteger = Number.isInteger(inputNumberValue);

    // TODO: Error handling
    if (!isAnInteger) {
      console.error('Input is not an integer', { input: inputValue });
      return;
    }

    websocket.send(
      JSON.stringify({ type: 'update-count', value: inputNumberValue })
    );

    setInputValue('');
    inputRef.current?.focus();
  };

  console.log({ elements });
  const highestNumber = useMemo(() => Math.max(...elements), [elements]);

  const elementsSorted = Array.from(elements).sort((a, b) => a - b);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  console.log({ elementsSorted });

  return (
    <div ref={scope}>
      <Dialog.Root>
        <Dialog.Trigger className='text-gray-500 underline fixed top-5 right-5 sm:bottom-5 sm:top-auto'>
          <span className='sm:hidden'>enjoy this?</span>
          <span className='hidden sm:block'>enjoy this website?</span>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content></Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <a
        target='_blank'
        className='hidden sm:block fixed bottom-5 left-5'
        href='https://github.com/noahbaron91/countinorder'
      >
        <GitHubIcon />
      </a>
      <div className='fixed sm:right-6 top-5 sm:justify-between left-5 text-lg text-gray-50 flex'>
        <div className='flex flex-col sm:flex-row sm:gap-5 lg:gap-7'>
          <p>High score: {highscore}</p>
          <PreviousAttemptsDialog />
        </div>
        <div className='hidden sm:flex items-center gap-3'>
          <div className='bg-[#ACFF58] animate-pulse rounded-full w-3 h-3' />
          <p className='text-gray-50'>100 users online</p>
        </div>
      </div>
      <div className='flex items-center gap-5'>
        {/* <Turnstile
          id='turnstile-1'
          options={{ size: 'normal', theme: 'light' }}
          ref={refTurnstile}
          className='rounded-md'
          siteKey='0x4AAAAAAALvq89KRwrAjqSU'
          onSuccess={() => console.log('success')}
        /> */}

        {/* TODO: fix centering */}
        <div
          className='fixed top-1/2 -translate-y-1/2 right-1/2 gap-8 text-[64px] flex'
          key={key}
        >
          {[...elementsSorted].map((number) => (
            <NumberElement
              key={number}
              number={number}
              isHighestNumber={highestNumber === number}
            />
          ))}
          {typeof failedNumber === 'number' && (
            <FailedNumberElement number={failedNumber} />
          )}
        </div>
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-3'>
          <div className='sm:hidden flex items-center gap-2'>
            <div className='bg-[#ACFF58] animate-pulse rounded-full w-3 h-3' />
            <p className='text-gray-50'>100 users online</p>
          </div>
          <div className=' border max-w-[95vw] min-[425px]:w-80 min-[500px]:bottom-6 border-gray-600 justify-between bg-gray-800 flex items-center px-4 py-3 rounded-xl'>
            <input
              placeholder='Write the next number'
              autoFocus
              ref={inputRef}
              value={inputValue}
              onKeyDown={handleKeyDown}
              className='flex-1 pl-2 text-white bg-transparent outline-none text-xl min-w-0'
              onChange={(event) => setInputValue(event.target.value)}
            />
            <button
              type='button'
              className='bg-gray-700 border border-gray-600 rounded w-11 h-11 flex items-center justify-center'
              onClick={handleSubmit}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z'
                  fill='#FAFAF9'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
