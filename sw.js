const CACHE_NAME = 'engg-prep-cache-v204';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './app.js',
  './questions.js',
  './notes.js',
  './advanced_questions.js',
  './exam_questions.js',
  './style.css',
  './firebase-config.js',
  './js/data-manager.js',
  './js/particles.js',
  './js/scratchpad.js',
  './js/global-search.js',
  './js/onboarding.js',
  './js/achievements.js',
  './js/tts.js',
  './js/weakness-srs.js',
  './js/daily-quests.js',
  './assets/data/community_milestones.json',
  './assets/videos/placeholder_poster.jpg',
  './assets/avatars/sabrish.jpg',
  './assets/avatars/linjo.jpg',
  './assets/avatars/adarsh.jpg',
  './assets/avatars/nainish.jpg',
  './assets/avatars/shariff.jpg',
  './js/fe-simulator.js',
  './manifest.json',
  './engg_tv_logo.png',
  './assets/images/angular_impulse_and_momentum_principle.jpg',
  './assets/images/beam_deflection_differential_governing_equation.jpg',
  './assets/images/bernoullis_principle.jpg',
  './assets/images/binary_phase_diagram_lever_rule.jpg',
  './assets/images/bonds_cash_flow_valuation.jpg',
  './assets/images/cantilever_beam_tip_deflection_point_load.jpg',
  './assets/images/capitalized_cost_infinite_project_life.jpg',
  './assets/images/carnot_thermal_efficiency_maximum_limit.jpg',
  './assets/images/castigliano_second_theorem_deflection.jpg',
  './assets/images/centroid_of_composite_planar_areas.jpg',
  './assets/images/coefficient_of_restitution_direct_central_impact.jpg',
  './assets/images/compressibility_factor_real_gas.jpg',
  './assets/images/continuity_equation_conservation_of_mass.jpg',
  './assets/images/cop_refrigerator_vs_heat_pump.jpg',
  './assets/images/coriolis_acceleration_rotating_frame.jpg',
  './assets/images/coulomb_dry_friction_angle_repose.jpg',
  './assets/images/damped_sdof_natural_frequency_damping_ratio.jpg',
  './assets/images/darcy_weisbach_friction_head_loss.jpg',
  './assets/images/dry_bulb_wet_bulb_dew_point.jpg',
  './assets/images/elastic_flexure_formula_beam_bending.jpg',
  './assets/images/engineering_economics_compound_interest.jpg',
  './assets/images/equivalent_resistance_series_parallel.jpg',
  './assets/images/eulers_critical_buckling_load.jpg',
  './assets/images/eutectic_eutectoid_invariant_reactions.jpg',
  './assets/images/first_law_of_thermodynamics_closed_system.jpg',
  './assets/images/flat_belt_friction_capstan_formula.jpg',
  './assets/images/fouriers_law_of_thermal_conduction.jpg',
  './assets/images/generalized_hookes_law_3d_elastic_stress_strain.jpg',
  './assets/images/hvac_processes_psychrometric.jpg',
  './assets/images/hydrostatic_pressure_distribution_depth.jpg',
  './assets/images/ideal_gas_law_equation_of_state.jpg',
  './assets/images/ideal_otto_cycle_efficiency_internal_combustion.jpg',
  './assets/images/ideal_rankine_cycle_thermal_efficiency.jpg',
  './assets/images/ideal_transformer_turns_ratio.jpg',
  './assets/images/intellectual_property_patents_trade_secrets_copyrights.jpg',
  './assets/images/isothermal_process_pv_ts.jpg',
  './assets/images/kirchhoffs_current_and_voltage_laws_kcl_kvl.jpg',
  './assets/images/laplace_transform_final_value_theorem.jpg',
  './assets/images/linear_impulse_momentum_jet_forces.jpg',
  './assets/images/log_mean_temperature_difference_lmtd.jpg',
  './assets/images/logarithmic_decrement_underdamped_vibrations.jpg',
  './assets/images/mass_moment_of_inertia_geometric_bodies.jpg',
  './assets/images/maximum_shear_stress_rectangular_beams.jpg',
  './assets/images/modified_goodman_fatigue_criterion.jpg',
  './assets/images/mohrs_circle_for_plane_stress.jpg',
  './assets/images/net_radiation_exchange_between_two_bodies.jpg',
  './assets/images/newtons_law_of_cooling_convective.jpg',
  './assets/images/normal_tangential_acceleration_curvilinear.jpg',
  './assets/images/ohms_law_joule_heating.jpg',
  './assets/images/parallel_axis_theorem_second_moment_of_area.jpg',
  './assets/images/psychrometric_chart_scientific.jpg',
  './assets/images/reynolds_number_dynamic_similarity.jpg',
  './assets/images/rotational_kinetic_energy_rigid_bodies.jpg',
  './assets/images/sdof_undamped_natural_frequency_vibrations.jpg',
  './assets/images/series_rlc_resonance_bandwidth.jpg',
  './assets/images/simply_supported_beam_udl_deflection.jpg',
  './assets/images/slenderness_ratio_steel_compression_members.jpg',
  './assets/images/speed_of_sound_mach_number_compressible.jpg',
  './assets/images/stefan_boltzmann_law_thermal_radiation.jpg',
  './assets/images/thermal_expansion_deformation_thermal_stress.jpg',
  './assets/images/thin_walled_pressure_vessel_hoop_longitudinal.jpg',
  './assets/images/torsion_formula_shaft_shear_stress_twist.jpg',
  './assets/images/transverse_shear_stress_beams_shear_formula.jpg',
  './assets/images/truss_zero_force_member_rules.jpg',
  './assets/images/two_phase_vapor_liquid_systems.jpg',
  './assets/images/types_of_fits.jpg',
  './assets/images/van_der_waals_equation_real_gases.jpg',
  './assets/images/varignon_theorem_of_moments.jpg',
  './assets/images/vector_length_and_unit_vector.jpg',
  './assets/images/vibration_transmissibility_harmonic_base.jpg',
  './assets/images/work_energy_principle_rigid_body_dynamics.jpg',
  './assets/images/zeroth_law_thermodynamics.jpg'
];

// Install Event - Precache App Shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Pre-caching App Shell');
        // Use a simple addAll, gracefully handling failures for specific files if any
        return Promise.allSettled(APP_SHELL.map(url => cache.add(url).catch(err => console.warn(`Failed to cache ${url}`, err))));
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase API requests (Firestore handles its own offline persistence)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('securetoken.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache with the new response
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Network fetch failed, falling back to cache if available.', err);
      });

      // Return the cached response immediately, or wait for the network response
      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event - Allow app to trigger manual asset caching
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.allSettled(event.data.urls.map(url => cache.add(url)));
      }).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});
