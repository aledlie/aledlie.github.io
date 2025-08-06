%
% Calculate the distance traveled by a golf ball bouncing along concrete.
%
% 09 Sept 2015
% Sumedh Joshi

% Physics: http://farside.ph.utexas.edu/teaching/336k/Newtonhtml/node29.html

   % Set some constants.
   g   = 9.81;         % Acceleration due to gravity.
   m   = 45.93 / 1000; % Mass of a golf ball in kg.
   r   = 0.02135;      % Radius of a golf ball in m.
   vt  = 31.36;        % Terminal velocity of a golf ball in m/s.
   cor = 0.85;         % Coefficient of resititution; unitless.
   cd  = m * g / vt;   % Drag coefficient.

   % Set some initial conditions in miles per hour, degrees from horizontal, and RPM.
   launch_speed    = 0;
   launch_angle    = 0;
   launch_backspin = 0;

   % Convert initial velocity to meters per second.
   v0 = launch_speed / 2.236;

   % Calculate the launch angle in radians.
   theta = launch_angle * pi / 180;

   % Calculate the backspin in radians / second.
   theta_dot = launch_backspin * ( 2 * pi ) / 60;

   % Set the terminal rotational velocity.
   theta_dot_t = vt / r;

   % Moment of rotational inertia of a golf ball.
   I = ( 2 / 5 ) * m * r^2;

   % Set the density of air in kg/m^3.
   rho = 1.02;

   % Time-stepping parameters.
   dt   = 1e-2;
   vmin = r/2;
   t  = [0];
   x  = [1];
   z  = [1.0];
   vx = [ v0 * cos( theta ) ];
   vz = [ v0 * sin( theta ) ];

   % Step forward in time until the velocity of the ball is small.
   xoffset = 0.0;
   bounce_count = 0;
   while hypot( vx(end), vz(end) ) > vmin || ( ( hypot( vx(end), vz(end) ) < vmin ) && z(end) > r )

      % Step forward in time.
      t = [ t; t(end) + dt ];

      % Calculate the Magnus force from the rotation.
      G   = 2 * pi * r^2 * theta_dot(end);
      Fm  = rho * G;

      % Integrate the velocities.
      iivx = vx(end) - dt * g * vx(end) / vt;
      iivz = vz(end) - dt * g * ( 1 + vz(end) / vt ) + dt * Fm * vx(end) / m;
      iix  = x(end) + dt * iivx;
      iiz  = z(end) + dt * iivz;

      % Model rotational decay.
      iitheta_dot = theta_dot(end) - dt * theta_dot(end) / theta_dot_t / I;
      theta_dot = [ theta_dot; iitheta_dot ];

      % Check for a bounce.
      if iiz < 0

         % Reset the launch angles and velocities.
         iiz = 0;
         iivz(end) = cor * -1.0 * iivz(end);
         theta = atan( iivz(end) / iivx(end) );

         % Set the backspin to zero.
         theta_dot(end) = -theta_dot(end);

         % Count bounces if it bounces significantly.
         bounce_count = bounce_count + 1;

         % Switch to a roll if the ball is done bouncing significantly.

      end

      % Store.
      x  = [x; iix];
      z  = [z; iiz];
      vx = [vx; iivx];
      vz = [vz; iivz];

   end

   % Convert to yards.
   m2y = 0.914;
   xy = x * m2y;
   zy = z * m2y;

